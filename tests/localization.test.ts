import { describe, expect, it } from 'vitest';
import vi from '../src/localization/vi-VN.json';

describe('Vietnamese localization', () => {
  it('contains all mandatory main menu labels', () => {
    expect(Object.values(vi.menu)).toEqual(expect.arrayContaining([
      'Trận đấu nhanh', 'Hai người chơi', 'Thi đấu trực tuyến',
      'Luyện tập', 'Trang bị', 'Cài đặt', 'Thoát trận'
    ]));
  });
  it('includes match and equipment strings', () => {
    expect(vi.gameplay.matchOver).toBe('Kết thúc trận đấu');
    expect(vi.equipment.overLimit).toBe('Độ căng vượt giới hạn của nhà sản xuất');
  });
});
