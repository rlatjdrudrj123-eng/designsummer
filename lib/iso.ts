/* 아이소메트릭 좌표계 (가이드 10장) — 2:1 다이메트릭.
   월드(타일) 좌표 ↔ 스크린 좌표 변환. 카메라 오프셋은 렌더러에서 더한다. */

export const GRID = {
  cols: 14,
  rows: 10,
  hw: 84, // 타일 half-width (가로) — 크게(줌인)
  hh: 42, // 타일 half-height (세로) — 2:1 (hw = 2*hh)
  wallH: 196, // 벽 높이(px, 스크린)
};

export type World = { tx: number; ty: number };
export type Screen = { x: number; y: number };

/** 월드(타일) → 스크린 (원점 기준). */
export function worldToScreen(tx: number, ty: number): Screen {
  return { x: (tx - ty) * GRID.hw, y: (tx + ty) * GRID.hh };
}

/** 스크린(원점 기준) → 월드(타일, 실수). */
export function screenToWorld(x: number, y: number): World {
  const tx = (x / GRID.hw + y / GRID.hh) / 2;
  const ty = (y / GRID.hh - x / GRID.hw) / 2;
  return { tx, ty };
}

/** 깊이 정렬 키 (y 기준). 값이 클수록 앞(나중에 그림). */
export function depth(tx: number, ty: number): number {
  return tx + ty;
}

/** 그리드 다이아몬드를 캔버스 중앙에 놓기 위한 원점 오프셋.
   (벽이 위로 솟으므로 살짝 아래로 내려 담는다.) */
export function cameraOrigin(cssW: number, cssH: number): Screen {
  const { cols, rows, hw, hh, wallH } = GRID;
  const midX = ((cols - rows) * hw) / 2;
  const midY = ((cols + rows) * hh) / 2;
  return {
    x: cssW / 2 - midX,
    y: cssH / 2 - midY + wallH * 0.35,
  };
}

/** 두 월드 좌표 거리(타일). */
export function tileDist(a: World, b: World): number {
  return Math.hypot(a.tx - b.tx, a.ty - b.ty);
}

export function clampToGrid(tx: number, ty: number): World {
  return {
    tx: Math.max(0, Math.min(GRID.cols - 1, tx)),
    ty: Math.max(0, Math.min(GRID.rows - 1, ty)),
  };
}
