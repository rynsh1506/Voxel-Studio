// src/utils/exportUtils.js

const SIZE = 30; // Sesuai dengan ukuran voxel di engine 3D kamu

export const generateExportCode = (format, voxels, options = {}) => {
  const { bg = "#1a1a1a", autoRotate = true } = options;
  let code = "";

  if (format === "html_3d") {
    // Export interaktif 3D menggunakan Three.js CDN
    const vData = JSON.stringify(
      voxels.map((v) => ({ x: v.gx, y: v.gy, z: v.gz, c: v.c })),
    );
    code = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Voxel 3D View</title>
  <style>body { margin: 0; overflow: hidden; background-color: ${bg}; }</style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
  <script>
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = ${autoRotate};
    controls.autoRotateSpeed = 2.0;

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(100, 200, 50);
    scene.add(dirLight);

    const voxelData = ${vData};
    const SIZE = ${SIZE};
    const geometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
    const edgesGeo = new THREE.EdgesGeometry(geometry);
    
    let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity, minZ=Infinity, maxZ=-Infinity;

    voxelData.forEach(v => {
        const mat = new THREE.MeshLambertMaterial({ color: v.c });
        const mesh = new THREE.Mesh(geometry, mat);
        let px = v.x * SIZE + SIZE/2, py = v.y * SIZE + SIZE/2, pz = v.z * SIZE + SIZE/2;
        mesh.position.set(px, py, pz);
        mesh.add(new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.1, transparent: true })));
        scene.add(mesh);
        minX = Math.min(minX, px); maxX = Math.max(maxX, px);
        minY = Math.min(minY, py); maxY = Math.max(maxY, py);
        minZ = Math.min(minZ, pz); maxZ = Math.max(maxZ, pz);
    });

    const cx = (minX + maxX) / 2 || 0, cy = (minY + maxY) / 2 || 0, cz = (minZ + maxZ) / 2 || 0;
    const maxDim = Math.max(maxX-minX, maxY-minY, maxZ-minZ);
    controls.target.set(cx, cy, cz);
    camera.position.set(cx + maxDim * 1.5, cy + maxDim * 1.5, cz + maxDim * 1.5);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const animate = () => { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); };
    animate();
  </script>
</body>
</html>`;
  } else if (format === "html_css") {
    // Export menggunakan murni HTML + CSS Transforms
    let divs = "";
    voxels.forEach((v) => {
      divs += `    <div class="cube" style="--x:${v.gx * SIZE}; --y:${-v.gy * SIZE}; --z:${v.gz * SIZE}; --c:${v.c};"><div class="face top"></div><div class="face bottom"></div><div class="face front"></div><div class="face back"></div><div class="face right"></div><div class="face left"></div></div>\n`;
    });
    code = `<!DOCTYPE html><html><head><style>body{margin:0;height:100vh;background:#111;display:flex;justify-content:center;align-items:center;overflow:hidden}.scene-container{perspective:2000px}.scene{transform-style:preserve-3d;transform:rotateX(-25deg) rotateY(45deg)}.cube{position:absolute;width:${SIZE}px;height:${SIZE}px;transform-style:preserve-3d;transform:translate3d(calc(var(--x)*1px),calc(var(--y)*1px),calc(var(--z)*1px))}.face{position:absolute;width:100%;height:100%;background:var(--c)}.top{transform:translate3d(0,0,${SIZE}px) rotateX(-90deg);transform-origin:top;filter:brightness(1.1)}.bottom{transform:translate3d(0,${SIZE}px,0) rotateX(90deg);transform-origin:top;filter:brightness(.4)}.front{transform:translate3d(0,0,${SIZE}px);filter:brightness(.9)}.back{transform:translate3d(0,0,0) rotateY(180deg);filter:brightness(.6)}.right{transform:translate3d(${SIZE}px,0,${SIZE}px) rotateY(90deg);transform-origin:left;filter:brightness(.75)}.left{transform:translate3d(0,0,0) rotateY(-90deg);transform-origin:left;filter:brightness(.5)}</style></head><body><div class="scene-container"><div class="scene">${divs}</div></div></body></html>`;
  } else if (format === "json") {
    // Export Raw Data JSON
    code = JSON.stringify(
      {
        voxelSize: SIZE,
        voxels: voxels.map((v) => ({
          x: v.gx,
          y: v.gy,
          z: v.gz,
          color: v.c,
        })),
      },
      null,
      2,
    );
  } else if (format === "obj") {
    // Export 3D Model Standar (OBJ)
    code = "# Voxel Studio Export\n";
    let vCount = 1;
    voxels.forEach((v) => {
      let x = v.gx * SIZE,
        y = v.gy * SIZE,
        z = v.gz * SIZE,
        s = SIZE;
      code += `v ${x} ${y} ${z}\nv ${x + s} ${y} ${z}\nv ${x + s} ${y + s} ${z}\nv ${x} ${y + s} ${z}\n`;
      code += `v ${x} ${y} ${z + s}\nv ${x + s} ${y} ${z + s}\nv ${x + s} ${y + s} ${z + s}\nv ${x} ${y + s} ${z + s}\n`;
      code += `f ${vCount} ${vCount + 1} ${vCount + 2} ${vCount + 3}\nf ${vCount + 4} ${vCount + 7} ${vCount + 6} ${vCount + 5}\nf ${vCount} ${vCount + 4} ${vCount + 5} ${vCount + 1}\nf ${vCount + 3} ${vCount + 2} ${vCount + 6} ${vCount + 7}\nf ${vCount} ${vCount + 3} ${vCount + 7} ${vCount + 4}\nf ${vCount + 1} ${vCount + 5} ${vCount + 6} ${vCount + 2}\n`;
      vCount += 8;
    });
  }

  return code;
};

export const downloadExportFile = (code, format) => {
  const ext = format === "obj" ? "obj" : format === "json" ? "json" : "html";
  const blob = new Blob([code], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Voxel_Export_${Date.now()}.${ext}`;
  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
