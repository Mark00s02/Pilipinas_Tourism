import base64
import os
import sys
import unittest

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from bake_terrain import decode_terrarium, lonlat_to_tile, tile_to_lonlat, pick_zoom, encode_b64, write_js  # noqa: E402


class BakeTerrainTest(unittest.TestCase):
    def test_terrarium_decode(self):
        px = np.array([[[128, 0, 0], [128, 100, 128]]], dtype=np.uint8)
        np.testing.assert_allclose(decode_terrarium(px), [[0.0, 100.5]])

    def test_tile_math(self):
        x, y = lonlat_to_tile(124.17, 9.83, 12)
        self.assertIsInstance(x, int)
        self.assertIsInstance(y, int)
        west, north = tile_to_lonlat(x, y, 12)
        east, south = tile_to_lonlat(x + 1, y + 1, 12)
        self.assertTrue(west <= 124.17 < east)
        self.assertTrue(south < 9.83 <= north)

    def test_pick_zoom(self):
        z = pick_zoom(9, 192, lat=11.97)
        self.assertLessEqual(z, 15)
        m_per_px = 156543.03 * np.cos(np.radians(11.97)) / 2 ** z
        self.assertLessEqual(m_per_px, 9000 / 192 / 1.5)
        # one level coarser would not be fine enough (unless capped)
        if z < 15:
            self.assertGreater(m_per_px * 2, 9000 / 192 / 1.5)

    def test_encode_roundtrip(self):
        arr = np.array([[0, -5], [300, 2954]], dtype=np.int16)
        back = np.frombuffer(base64.b64decode(encode_b64(arr)), dtype='<i2').reshape(2, 2)
        np.testing.assert_array_equal(back, arr)

    def test_write_js(self):
        js = write_js('x', np.zeros((2, 2), np.int16), [1, 2, 3, 4], 50.0)
        self.assertTrue(js.startswith("window.PH_TERRAIN=window.PH_TERRAIN||{};window.PH_TERRAIN['x']="))


if __name__ == '__main__':
    unittest.main()
