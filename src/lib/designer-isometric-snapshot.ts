import * as THREE from "three";

const SNAPSHOT_SIZE = 1024;
const ISO_DIRECTION = new THREE.Vector3(1, 1, 1).normalize();

/** Matches SmartWallsBalcony in IsometricScene. */
const SNAPSHOT_WALL_HEIGHT = 2.4;
const SNAPSHOT_PADDING = 0.45;

function getBalconyBounds(roomWMeters: number, roomDMeters: number) {
  const wallInset = 0.12;
  return new THREE.Box3(
    new THREE.Vector3(-roomWMeters / 2 - wallInset, 0, -roomDMeters / 2 - wallInset),
    new THREE.Vector3(roomWMeters / 2 + wallInset, SNAPSHOT_WALL_HEIGHT + 0.12, roomDMeters / 2 + wallInset)
  );
}

function expandBoundsWithScene(scene: THREE.Scene, box: THREE.Box3) {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.visible) return;

    const meshBox = new THREE.Box3().setFromObject(mesh);
    if (meshBox.isEmpty()) return;
    if (meshBox.max.y > 4 || meshBox.min.y < -0.25) return;

    box.union(meshBox);
  });
}

function frameIsometricCamera(camera: THREE.OrthographicCamera, box: THREE.Box3, padding: number) {
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const distance = Math.max(size.x, size.y, size.z) * 4;

  camera.position.copy(center).addScaledVector(ISO_DIRECTION, distance);
  camera.lookAt(center);
  camera.updateMatrixWorld();

  const corners = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ];

  let maxExtent = 0;
  for (const corner of corners) {
    const view = corner.clone().applyMatrix4(camera.matrixWorldInverse);
    maxExtent = Math.max(maxExtent, Math.abs(view.x), Math.abs(view.y));
  }

  const halfExtent = maxExtent + padding;
  camera.left = -halfExtent;
  camera.right = halfExtent;
  camera.top = halfExtent;
  camera.bottom = -halfExtent;
  camera.near = 0.1;
  camera.far = distance * 4;
  camera.updateProjectionMatrix();
}

/** Fixed isometric framing — orthographic, equal axis angles, square output. */
export function captureIsometricSnapshot(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  roomWMeters: number,
  roomDMeters: number
): string {
  const bounds = getBalconyBounds(roomWMeters, roomDMeters);
  expandBoundsWithScene(scene, bounds);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
  frameIsometricCamera(camera, bounds, SNAPSHOT_PADDING);

  const renderTarget = new THREE.WebGLRenderTarget(SNAPSHOT_SIZE, SNAPSHOT_SIZE);
  const previousTarget = gl.getRenderTarget();

  gl.setRenderTarget(renderTarget);
  gl.clear();
  gl.render(scene, camera);
  gl.setRenderTarget(previousTarget);

  const pixels = new Uint8Array(SNAPSHOT_SIZE * SNAPSHOT_SIZE * 4);
  gl.readRenderTargetPixels(renderTarget, 0, 0, SNAPSHOT_SIZE, SNAPSHOT_SIZE, pixels);
  renderTarget.dispose();

  const canvas = document.createElement("canvas");
  canvas.width = SNAPSHOT_SIZE;
  canvas.height = SNAPSHOT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const imageData = ctx.createImageData(SNAPSHOT_SIZE, SNAPSHOT_SIZE);
  for (let y = 0; y < SNAPSHOT_SIZE; y += 1) {
    for (let x = 0; x < SNAPSHOT_SIZE; x += 1) {
      const src = ((SNAPSHOT_SIZE - 1 - y) * SNAPSHOT_SIZE + x) * 4;
      const dst = (y * SNAPSHOT_SIZE + x) * 4;
      imageData.data[dst] = pixels[src]!;
      imageData.data[dst + 1] = pixels[src + 1]!;
      imageData.data[dst + 2] = pixels[src + 2]!;
      imageData.data[dst + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export const designerSnapshotSize = SNAPSHOT_SIZE;
