import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))
from bake_imagery import tile_url, pick_zoom, read_bbox, levels_from, apply_levels  # noqa: E402


class BakeImageryTest(unittest.TestCase):
    def test_tile_url_is_row_then_column(self):
        self.assertEqual(tile_url(13, 6812, 3840), 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/13/3840/6812.jpg')

    def test_pick_zoom_matches_texture_resolution(self):
        # 22 km over 1024 px wants ~21 m/px: z13 (~18.7 m/px at 11 deg) is the first fine enough level
        self.assertEqual(pick_zoom(22, 1024, lat=11.13), 13)
        self.assertLessEqual(pick_zoom(1, 1024, lat=11), 14)  # never past Sentinel-2's native ~10 m

    def test_shared_levels_map_equal_pixels_equally(self):
        from PIL import Image
        wide = Image.new('RGB', (10, 10), (40, 60, 80)); wide.putpixel((0, 0), (10, 20, 30)); wide.putpixel((1, 1), (200, 210, 220))
        detail = Image.new('RGB', (4, 4), (40, 60, 80))
        lv = levels_from(wide)
        a, b = apply_levels(wide, lv), apply_levels(detail, lv)
        self.assertEqual(a.getpixel((5, 5)), b.getpixel((2, 2)))  # same source colour -> same output in both images
        self.assertEqual(apply_levels(wide, lv).getpixel((1, 1)), (255, 255, 255))  # the bright end stretches to white

    def test_ocean_dominated_view_does_not_blow_out_land(self):
        from PIL import Image
        sea = Image.new('RGB', (100, 100), (12, 30, 45))  # almost all dark ocean ...
        for x in range(3): sea.putpixel((x, 0), (70, 90, 50))  # ... with a little land
        lv = levels_from(sea)
        land = apply_levels(sea, lv).getpixel((0, 0))
        self.assertLess(max(land), 250, f'land stretched to {land}')

    def test_read_bbox_from_baked_terrain_js(self):
        js = ("window.PH_TERRAIN=window.PH_TERRAIN||{};window.PH_TERRAIN['x']={\"w\": 2, \"h\": 2, \"bbox\": [1.5, 2.5, 3.5, 4.5], \"cellM\": 1, \"b64\": \"AAA=\"};\n"
              "window.PH_TERRAIN=window.PH_TERRAIN||{};window.PH_TERRAIN['x:outer']={\"w\": 2, \"h\": 2, \"bbox\": [0, 1, 5, 6], \"cellM\": 9, \"b64\": \"AAA=\"};\n")
        self.assertEqual(read_bbox(js, 'x'), [1.5, 2.5, 3.5, 4.5])
        self.assertEqual(read_bbox(js, 'x:outer'), [0, 1, 5, 6])


if __name__ == '__main__':
    unittest.main()
