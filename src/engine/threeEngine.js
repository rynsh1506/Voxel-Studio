import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useStore } from "../store/useStore";

export const createEngine = () => {
  const SIZE = 30;
  let scene,
    camera,
    renderer,
    controls,
    planeMesh,
    gridHelper,
    previewGroup,
    hoverMesh;
  let raycaster = new THREE.Raycaster(),
    mouse = new THREE.Vector2();
  let voxels = new Map(),
    selectedVoxels = new Set(),
    objectsToIntersect = [];
  let history = [],
    hIndex = -1;
  let isDrawing = false,
    isExtruding = false,
    isMoving = false;
  let startIdx = null,
    endIdx = null,
    extrudeStartY = 0,
    extrudeStartX = 0;
  let dragPlane = new THREE.Plane(),
    drawingPlane = new THREE.Plane(),
    dragStartPoint = new THREE.Vector3();
  let currentDragOffset = { dx: 0, dy: 0, dz: 0 };

  const voxelGeometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
  const edgesGeometry = new THREE.EdgesGeometry(voxelGeometry);

  const getIndexKey = (gx, gy, gz) => `${gx},${gy},${gz}`;
  const getThreePos = (gx, gy, gz) =>
    new THREE.Vector3(
      gx * SIZE + SIZE / 2,
      gy * SIZE + SIZE / 2,
      gz * SIZE + SIZE / 2,
    );

  const updateStoreCount = () =>
    useStore.getState().setStore({
      voxelCount: voxels.size,
      selectedCount: selectedVoxels.size,
    });

  const saveState = () => {
    const s = useStore.getState();
    if (hIndex < history.length - 1) history = history.slice(0, hIndex + 1);
    history.push({
      gridSize: s.gridSize,
      voxels: Array.from(voxels.values()).map((v) => ({
        gx: v.gx,
        gy: v.gy,
        gz: v.gz,
        c: v.c,
      })),
    });
    hIndex++;
    updateStoreCount();
  };

  const addVoxel = (gx, gy, gz, color) => {
    // FIX: Batasan if (gy < 0) return; dihapus agar bisa buat voxel di bawah grid
    const key = getIndexKey(gx, gy, gz);
    if (voxels.has(key)) return;
    const mesh = new THREE.Mesh(
      voxelGeometry,
      new THREE.MeshLambertMaterial({ color }),
    );
    mesh.position.copy(getThreePos(gx, gy, gz));
    mesh.add(
      new THREE.LineSegments(
        edgesGeometry,
        new THREE.LineBasicMaterial({
          color: 0x000000,
          opacity: 0.2,
          transparent: true,
        }),
      ),
    );
    scene.add(mesh);
    objectsToIntersect.push(mesh);
    voxels.set(key, { gx, gy, gz, c: color, mesh });
  };

  const removeVoxel = (key) => {
    const v = voxels.get(key);
    if (v) {
      scene.remove(v.mesh);
      objectsToIntersect = objectsToIntersect.filter((o) => o !== v.mesh);
      voxels.delete(key);
      selectedVoxels.delete(key);
      v.mesh.geometry.dispose();
      v.mesh.material.dispose();
    }
  };

  const buildGridFloor = (gridSize, showGrid, theme) => {
    if (planeMesh) scene.remove(planeMesh);
    if (gridHelper) scene.remove(gridHelper);
    const s = gridSize * SIZE;
    planeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(s, 2, s),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    planeMesh.position.set(s / 2, -1, s / 2);
    scene.add(planeMesh);
    const isLight = theme === "light";
    gridHelper = new THREE.GridHelper(
      s,
      gridSize,
      isLight ? 0x9ca3af : 0x444444,
      isLight ? 0xd1d5db : 0x2a2a2a,
    );
    gridHelper.position.set(s / 2, 0, s / 2);
    gridHelper.visible = showGrid;
    scene.add(gridHelper);
    objectsToIntersect = [planeMesh];
    voxels.forEach((v) => objectsToIntersect.push(v.mesh));
  };

  const centerCamera = (viewType, gridSize) => {
    const center = (gridSize * SIZE) / 2;
    if (viewType === "iso")
      camera.position.set(center + 500, 500, center + 500);
    else if (viewType === "top")
      camera.position.set(center, 1000, center + 0.1);
    else camera.position.set(center, 0, center + 1000);
    camera.up.set(0, 1, 0);
    camera.lookAt(center, 0, center);
    if (controls) {
      controls.target.set(center, 0, center);
      controls.update();
    }
  };

  const getIntersectIndex = (intersect, currentTool) => {
    if (!intersect.face) return null;
    let pos = intersect.point.clone();
    let normal = intersect.face.normal.clone();
    if (intersect.object === planeMesh) {
      if (["erase", "paint", "pick"].includes(currentTool)) return null;
      pos.y += 1;
    } else {
      if (["pen", "line", "box"].includes(currentTool))
        pos.add(normal.multiplyScalar(SIZE / 2));
      else pos.sub(normal.multiplyScalar(SIZE / 2));
    }
    return {
      gx: Math.floor(pos.x / SIZE),
      gy: Math.floor(pos.y / SIZE),
      gz: Math.floor(pos.z / SIZE),
      nx: Math.round(normal.x),
      ny: Math.round(normal.y),
      nz: Math.round(normal.z),
    };
  };

  const getPoints = (p1, p2, tool, symX, symZ, gridSize) => {
    let pts = [];
    if (tool === "line") {
      let d = Math.max(
        Math.abs(p2.gx - p1.gx),
        Math.abs(p2.gy - p1.gy),
        Math.abs(p2.gz - p1.gz),
      );
      if (d === 0) return [p1];
      for (let i = 0; i <= d; i++)
        pts.push({
          gx: Math.round(p1.gx + (p2.gx - p1.gx) * (i / d)),
          gy: Math.round(p1.gy + (p2.gy - p1.gy) * (i / d)),
          gz: Math.round(p1.gz + (p2.gz - p1.gz) * (i / d)),
        });
    } else if (tool === "box" || tool === "select") {
      let minX = Math.min(p1.gx, p2.gx),
        maxX = Math.max(p1.gx, p2.gx),
        minY = Math.min(p1.gy, p2.gy),
        maxY = Math.max(p1.gy, p2.gy),
        minZ = Math.min(p1.gz, p2.gz),
        maxZ = Math.max(p1.gz, p2.gz);
      for (let x = minX; x <= maxX; x++)
        for (let y = minY; y <= maxY; y++)
          for (let z = minZ; z <= maxZ; z++) pts.push({ gx: x, gy: y, gz: z });
    } else pts = [p2];

    if (["pen", "line", "box", "erase", "paint"].includes(tool)) {
      let symPts = [];
      let cx = (gridSize - 1) / 2,
        cz = (gridSize - 1) / 2;
      pts.forEach((p) => {
        symPts.push(p);
        if (symX)
          symPts.push({ gx: Math.round(cx + (cx - p.gx)), gy: p.gy, gz: p.gz });
        if (symZ)
          symPts.push({ gx: p.gx, gy: p.gy, gz: Math.round(cz + (cz - p.gz)) });
        if (symX && symZ)
          symPts.push({
            gx: Math.round(cx + (cx - p.gx)),
            gy: p.gy,
            gz: Math.round(cz + (cz - p.gz)),
          });
      });
      const unique = [];
      const set = new Set();
      for (let p of symPts) {
        let k = `${p.gx},${p.gy},${p.gz}`;
        if (!set.has(k)) {
          set.add(k);
          unique.push(p);
        }
      }
      return unique;
    }
    return pts;
  };

  const getPreviewTexture = () => {
    if (window._previewTex) return window._previewTex;
    const cvs = document.createElement("canvas");
    cvs.width = 128;
    cvs.height = 128;
    const ctx = cvs.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 16;
    ctx.strokeRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(cvs);
    tex.magFilter = THREE.NearestFilter;
    window._previewTex = tex;
    return tex;
  };

  const updatePreview = (p1, p2, tool, currentColor, symX, symZ, gridSize) => {
    while (previewGroup.children.length > 0)
      previewGroup.remove(previewGroup.children[0]);
    const matColor =
      tool === "select" ? 0x0ea5e9 : tool === "erase" ? 0xef4444 : currentColor;
    const mat = new THREE.MeshBasicMaterial({
      color: matColor,
      map: getPreviewTexture(),
      opacity: 0.7,
      transparent: true,
      depthWrite: false,
    });
    let pts = getPoints(p1, p2, tool, symX, symZ, gridSize);
    if (pts.length === 0) return;
    if (pts.length > 20000) pts = pts.slice(0, 20000);
    const iMesh = new THREE.InstancedMesh(voxelGeometry, mat, pts.length);
    const dummy = new THREE.Object3D();
    let validCount = 0;
    pts.forEach((p) => {
      // FIX: Batasan if (p.gy >= 0) dihapus agar garis preview tetap kelihatan di bawah tanah
      dummy.position.copy(getThreePos(p.gx, p.gy, p.gz));
      dummy.scale.set(1.02, 1.02, 1.02);
      dummy.updateMatrix();
      iMesh.setMatrixAt(validCount, dummy.matrix);
      validCount++;
    });
    iMesh.count = validCount;
    iMesh.instanceMatrix.needsUpdate = true;
    previewGroup.add(iMesh);
  };

  const clearSelection = () => {
    selectedVoxels.forEach((k) =>
      voxels.get(k)?.mesh.material.emissive.setHex(0),
    );
    selectedVoxels.clear();
    updateStoreCount();
  };

  const commitAction = (
    p1,
    p2,
    isShift,
    tool,
    currentColor,
    symX,
    symZ,
    gridSize,
  ) => {
    let pts = getPoints(p1, p2, tool, symX, symZ, gridSize);
    if (tool === "select") {
      if (!isShift) clearSelection();
      pts.forEach((p) => {
        let k = getIndexKey(p.gx, p.gy, p.gz);
        if (voxels.has(k)) {
          selectedVoxels.add(k);
          voxels.get(k).mesh.material.emissive.setHex(0x333333);
        }
      });
      updateStoreCount();
      return;
    }
    let chg = false;
    pts.forEach((p) => {
      let k = getIndexKey(p.gx, p.gy, p.gz);
      if (tool === "erase") {
        if (voxels.has(k)) {
          removeVoxel(k);
          chg = true;
        }
      } else if (tool === "paint") {
        if (voxels.has(k)) {
          voxels.get(k).c = currentColor;
          voxels.get(k).mesh.material.color.set(currentColor);
          chg = true;
        }
      } else {
        if (!voxels.has(k)) {
          addVoxel(p.gx, p.gy, p.gz, currentColor);
          chg = true;
        }
      }
    });
    if (chg) saveState();
  };

  const cancelDrawing = () => {
    isDrawing = false;
    isExtruding = false;
    isMoving = false;
    if (controls) controls.enabled = true;
    previewGroup.position.set(0, 0, 0);
    while (previewGroup.children.length > 0)
      previewGroup.remove(previewGroup.children[0]);
    useStore
      .getState()
      .setStore({ statusMsgKey: "msgReady", isExtrudingUI: false });
  };

  const engineActions = {
    undo: () => {
      if (isDrawing || isExtruding || isMoving) cancelDrawing();
      else if (hIndex > 0) {
        hIndex--;
        voxels.forEach((v) => {
          scene.remove(v.mesh);
          v.mesh.material.dispose();
        });
        voxels.clear();
        selectedVoxels.clear();
        const st = history[hIndex];
        if (st.gridSize !== useStore.getState().gridSize) {
          useStore.getState().setStore({ gridSize: st.gridSize });
          buildGridFloor(
            st.gridSize,
            useStore.getState().showGrid,
            useStore.getState().theme,
          );
        } else objectsToIntersect = [planeMesh];
        st.voxels.forEach((v) => addVoxel(v.gx, v.gy, v.gz, v.c));
        updateStoreCount();
      }
    },
    redo: () => {
      if (isDrawing || isExtruding || isMoving) cancelDrawing();
      if (hIndex < history.length - 1) {
        hIndex++;
        voxels.forEach((v) => {
          scene.remove(v.mesh);
          v.mesh.material.dispose();
        });
        voxels.clear();
        selectedVoxels.clear();
        const st = history[hIndex];
        if (st.gridSize !== useStore.getState().gridSize) {
          useStore.getState().setStore({ gridSize: st.gridSize });
          buildGridFloor(
            st.gridSize,
            useStore.getState().showGrid,
            useStore.getState().theme,
          );
        } else objectsToIntersect = [planeMesh];
        st.voxels.forEach((v) => addVoxel(v.gx, v.gy, v.gz, v.c));
        updateStoreCount();
      }
    },
    clearAll: (triggerSave = true) => {
      voxels.forEach((v) => {
        scene.remove(v.mesh);
        v.mesh.material.dispose();
      });
      voxels.clear();
      selectedVoxels.clear();
      objectsToIntersect = [planeMesh];
      if (triggerSave) saveState();
      updateStoreCount();
    },
    setView: (v) => centerCamera(v, useStore.getState().gridSize),
    toggleGrid: () => {
      if (gridHelper) gridHelper.visible = useStore.getState().showGrid;
    },
    applyColorToSelection: (color) => {
      if (selectedVoxels.size > 0) {
        selectedVoxels.forEach((k) => {
          let v = voxels.get(k);
          if (v) {
            v.c = color;
            v.mesh.material.color.set(color);
          }
        });
        saveState();
      }
    },
    deleteSelected: () => {
      selectedVoxels.forEach((k) => removeVoxel(k));
      saveState();
      updateStoreCount();
    },
    selectAll: () => {
      voxels.forEach((v, k) => {
        selectedVoxels.add(k);
        v.mesh.material.emissive.setHex(0x333333);
      });
      updateStoreCount();
    },
    transformSelection: (type) => {
      const arr = [];
      let minX = Infinity,
        maxX = -Infinity,
        minZ = Infinity,
        maxZ = -Infinity;
      selectedVoxels.forEach((k) => {
        let v = voxels.get(k);
        if (v) {
          arr.push({ ...v });
          minX = Math.min(minX, v.gx);
          maxX = Math.max(maxX, v.gx);
          minZ = Math.min(minZ, v.gz);
          maxZ = Math.max(maxZ, v.gz);
        }
        removeVoxel(k);
      });
      let w = maxX - minX;
      let d = maxZ - minZ;
      arr.forEach((v) => {
        let nx = v.gx,
          nz = v.gz;
        if (type === "rotY") {
          let rx = v.gx - minX;
          let rz = v.gz - minZ;
          nx = minX + Math.trunc((w - d) / 2) + (d - rz);
          nz = minZ + Math.trunc((d - w) / 2) + rx;
        } else if (type === "mirX") {
          nx = minX + (w - (v.gx - minX));
        }
        addVoxel(nx, v.gy, nz, v.c);
        let nk = getIndexKey(nx, v.gy, nz);
        selectedVoxels.add(nk);
        voxels.get(nk)?.mesh.material.emissive.setHex(0x333333);
      });
      saveState();
      updateStoreCount();
    },
    cancelDrawing,
    getVoxelsData: () => Array.from(voxels.values()),
    forceRebuildGrid: (size) =>
      buildGridFloor(
        size,
        useStore.getState().showGrid,
        useStore.getState().theme,
      ),
    manualAddVoxel: (gx, gy, gz, c) => addVoxel(gx, gy, gz, c),
    manualSaveState: () => saveState(),
  };

  const init = (canvasContainer) => {
    const w = canvasContainer.clientWidth || 800;
    const h = canvasContainer.clientHeight || 600;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    canvasContainer.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const d1 = new THREE.DirectionalLight(0xffffff, 0.6);
    d1.position.set(100, 200, 50);
    scene.add(d1);
    previewGroup = new THREE.Group();
    scene.add(previewGroup);
    hoverMesh = new THREE.Mesh(
      new THREE.BoxGeometry(SIZE + 0.5, SIZE + 0.5, SIZE + 0.5),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.3,
        transparent: true,
        wireframe: true,
      }),
    );
    scene.add(hoverMesh);

    const st = useStore.getState();
    buildGridFloor(st.gridSize, st.showGrid, st.theme);
    centerCamera(st.activeView, st.gridSize);
    st.setEngineActions(engineActions);

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onDown = (e) => {
      const s = useStore.getState();
      if (e.button === 2) {
        s.setStore({ isOrbiting: true });
        return;
      }
      if (isExtruding) {
        if (e.button === 0)
          commitAction(
            startIdx,
            endIdx,
            e.shiftKey,
            s.currentTool,
            s.currentColor,
            s.symX,
            s.symZ,
            s.gridSize,
          );
        cancelDrawing();
        return;
      }
      if (e.button !== 0) return;
      raycaster.setFromCamera(mouse, camera);
      const int = raycaster.intersectObjects(objectsToIntersect);
      if (int.length > 0) {
        if (s.currentTool === "move") {
          if (s.selectedCount === 0) {
            s.setStore({ statusMsgKey: "msgMoveFail" });
            return;
          }
          let camDir = new THREE.Vector3();
          camera.getWorldDirection(camDir);
          dragPlane.setFromNormalAndCoplanarPoint(
            camDir.negate(),
            int[0].point,
          );
          dragStartPoint.copy(int[0].point);
          currentDragOffset = { dx: 0, dy: 0, dz: 0 };
          controls.enabled = false;
          isMoving = true;
          s.setStore({ statusMsgKey: "msgMove" });
          while (previewGroup.children.length > 0)
            previewGroup.remove(previewGroup.children[0]);
          previewGroup.position.set(0, 0, 0);
          selectedVoxels.forEach((k) => {
            let v = voxels.get(k);
            if (v) {
              const m = new THREE.Mesh(
                voxelGeometry,
                new THREE.MeshLambertMaterial({
                  color: v.c,
                  opacity: 0.6,
                  transparent: true,
                }),
              );
              m.position.copy(getThreePos(v.gx, v.gy, v.gz));
              m.add(
                new THREE.LineSegments(
                  edgesGeometry,
                  new THREE.LineBasicMaterial({
                    color: 0xffffff,
                    opacity: 0.5,
                    transparent: true,
                  }),
                ),
              );
              previewGroup.add(m);
            }
          });
          return;
        }
        if (s.currentTool === "pick" && int[0].object !== planeMesh) {
          let idx = getIntersectIndex(int[0], s.currentTool);
          if (idx) {
            let c = voxels.get(getIndexKey(idx.gx, idx.gy, idx.gz))?.c;
            if (c) {
              s.setStore({ currentColor: c });
              engineActions.applyColorToSelection(c);
            }
          }
          return;
        }
        let idx = getIntersectIndex(int[0], s.currentTool);
        if (!idx) return;
        controls.enabled = false;
        isDrawing = true;
        startIdx = { ...idx };
        endIdx = { ...idx };
        if (["pen", "erase", "paint"].includes(s.currentTool)) {
          commitAction(
            startIdx,
            startIdx,
            e.shiftKey,
            s.currentTool,
            s.currentColor,
            s.symX,
            s.symZ,
            s.gridSize,
          );
        } else {
          if (["box", "select"].includes(s.currentTool)) {
            let normal = new THREE.Vector3();
            if (s.axisLock === "x") normal.set(1, 0, 0);
            else if (s.axisLock === "y") normal.set(0, 1, 0);
            else if (s.axisLock === "z") normal.set(0, 0, 1);
            drawingPlane.setFromNormalAndCoplanarPoint(
              normal,
              getThreePos(idx.gx, idx.gy, idx.gz),
            );
            s.setStore({ statusMsgKey: "msgLock" });
          }
          updatePreview(
            startIdx,
            endIdx,
            s.currentTool,
            s.currentColor,
            s.symX,
            s.symZ,
            s.gridSize,
          );
        }
      } else if (s.currentTool === "select" && !e.shiftKey) clearSelection();
    };

    const onMove = (e) => {
      const rect = canvasContainer.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const s = useStore.getState();
      if (isMoving) {
        let intersectPoint = new THREE.Vector3();
        let target = raycaster.ray.intersectPlane(dragPlane, intersectPoint);
        if (target) {
          let diff = target.clone().sub(dragStartPoint);
          let dx = Math.round(diff.x / SIZE),
            dy = Math.round(diff.y / SIZE),
            dz = Math.round(diff.z / SIZE);
          currentDragOffset = { dx, dy, dz };
          s.setStore({
            coordDisplay: `${s.t().msgShift}: X(${dx}) Y(${dy}) Z(${dz})`,
          });
          previewGroup.position.set(dx * SIZE, dy * SIZE, dz * SIZE);
        }
        return;
      }
      if (isExtruding) {
        const pRatio = 15;
        let delta = 0;
        if (s.axisLock === "y") {
          delta = Math.round((extrudeStartY - e.clientY) / pRatio);
          endIdx.gy = startIdx.gy + delta;
        } else if (s.axisLock === "x") {
          delta = Math.round((e.clientX - extrudeStartX) / pRatio);
          endIdx.gx = startIdx.gx + delta;
        } else if (s.axisLock === "z") {
          let dY = Math.round((extrudeStartY - e.clientY) / pRatio),
            dX = Math.round((e.clientX - extrudeStartX) / pRatio);
          delta = Math.abs(dX) > Math.abs(dY) ? dX : dY;
          endIdx.gz = startIdx.gz + delta;
        }
        s.setStore({
          coordDisplay: `X: ${endIdx.gx} | Y: ${endIdx.gy} | Z: ${endIdx.gz} (${s.t().msgThick}: ${Math.abs(delta) + 1})`,
        });
        updatePreview(
          startIdx,
          endIdx,
          s.currentTool,
          s.currentColor,
          s.symX,
          s.symZ,
          s.gridSize,
        );
        return;
      }
      if (
        isDrawing &&
        !isExtruding &&
        ["box", "select"].includes(s.currentTool)
      ) {
        let intersectPoint = new THREE.Vector3();
        let target = raycaster.ray.intersectPlane(drawingPlane, intersectPoint);
        if (target) {
          endIdx.gx =
            s.axisLock === "x" ? startIdx.gx : Math.floor(target.x / SIZE);
          endIdx.gy =
            s.axisLock === "y" ? startIdx.gy : Math.floor(target.y / SIZE);
          endIdx.gz =
            s.axisLock === "z" ? startIdx.gz : Math.floor(target.z / SIZE);
          s.setStore({
            coordDisplay: `X: ${endIdx.gx} | Y: ${endIdx.gy} | Z: ${endIdx.gz}`,
          });
          updatePreview(
            startIdx,
            endIdx,
            s.currentTool,
            s.currentColor,
            s.symX,
            s.symZ,
            s.gridSize,
          );
        }
        return;
      }
      const int = raycaster.intersectObjects(objectsToIntersect);
      if (int.length > 0) {
        let idx = getIntersectIndex(int[0], s.currentTool);
        if (idx) {
          hoverMesh.position.copy(getThreePos(idx.gx, idx.gy, idx.gz));
          hoverMesh.visible = true;
          if (!isDrawing)
            s.setStore({
              coordDisplay: `X: ${idx.gx} | Y: ${idx.gy} | Z: ${idx.gz}`,
            });
          else {
            if (["pen", "erase", "paint"].includes(s.currentTool)) {
              commitAction(
                idx,
                idx,
                e.shiftKey,
                s.currentTool,
                s.currentColor,
                s.symX,
                s.symZ,
                s.gridSize,
              );
              s.setStore({
                coordDisplay: `X: ${idx.gx} | Y: ${idx.gy} | Z: ${idx.gz}`,
              });
            } else {
              endIdx.gx = idx.gx;
              endIdx.gz = idx.gz;
              endIdx.gy = idx.gy;
              s.setStore({
                coordDisplay: `X: ${endIdx.gx} | Y: ${endIdx.gy} | Z: ${endIdx.gz}`,
              });
              updatePreview(
                startIdx,
                endIdx,
                s.currentTool,
                s.currentColor,
                s.symX,
                s.symZ,
                s.gridSize,
              );
            }
          }
        } else hoverMesh.visible = false;
      } else hoverMesh.visible = false;
    };

    const onUp = (e) => {
      const s = useStore.getState();
      if (e.button === 2) s.setStore({ isOrbiting: false });
      if (isMoving) {
        let { dx, dy, dz } = currentDragOffset;
        if (dx !== 0 || dy !== 0 || dz !== 0) {
          const arr = [];
          const isClone = e.altKey;
          selectedVoxels.forEach((k) => {
            arr.push({ ...voxels.get(k) });
            if (!isClone) removeVoxel(k);
          });
          if (isClone) clearSelection();
          arr.forEach((v) => {
            let nx = v.gx + dx,
              ny = v.gy + dy,
              nz = v.gz + dz;
            addVoxel(nx, ny, nz, v.c);
            let nk = getIndexKey(nx, ny, nz);
            selectedVoxels.add(nk);
            voxels.get(nk)?.mesh.material.emissive.setHex(0x333333);
          });
          saveState();
          updateStoreCount();
        }
        previewGroup.position.set(0, 0, 0);
        while (previewGroup.children.length > 0)
          previewGroup.remove(previewGroup.children[0]);
        isMoving = false;
        controls.enabled = true;
        s.setStore({ statusMsgKey: "msgReady" });
        return;
      }
      if (isDrawing && !isExtruding) {
        if (["box", "select"].includes(s.currentTool)) {
          isExtruding = true;
          extrudeStartY = e.clientY;
          extrudeStartX = e.clientX;
          s.setStore({ statusMsgKey: "msgExtrude", isExtrudingUI: true });
        } else {
          if (s.currentTool === "line") {
            raycaster.setFromCamera(mouse, camera);
            const int = raycaster.intersectObjects(objectsToIntersect);
            if (int.length > 0) {
              let idx = getIntersectIndex(int[0], s.currentTool);
              if (idx)
                commitAction(
                  startIdx,
                  idx,
                  e.shiftKey,
                  s.currentTool,
                  s.currentColor,
                  s.symX,
                  s.symZ,
                  s.gridSize,
                );
            }
          }
          cancelDrawing();
        }
      }
    };

    canvasContainer.addEventListener("pointerdown", onDown);
    canvasContainer.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvasContainer.addEventListener("contextmenu", (e) => e.preventDefault());

    const ro = new ResizeObserver(() => {
      camera.aspect =
        canvasContainer.clientWidth / canvasContainer.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        canvasContainer.clientWidth,
        canvasContainer.clientHeight,
      );
    });
    ro.observe(canvasContainer);

    return () => {
      cancelAnimationFrame(reqId);
      ro.disconnect();
      canvasContainer.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      renderer.dispose();
      canvasContainer.innerHTML = "";
    };
  };

  return { init, engineActions };
};
