import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))
from build_map import project, ring_to_path, PROJ, DEST_PROVINCES  # noqa: E402


class BuildMapTest(unittest.TestCase):
    def test_project_north_is_up_and_east_is_right(self):
        x1, y1 = project(120.0, 15.0)
        x2, y2 = project(121.0, 14.0)
        self.assertGreater(x2, x1)
        self.assertGreater(y2, y1)

    def test_project_origin(self):
        self.assertEqual(project(PROJ['lon0'], PROJ['lat1']), (0.0, 0.0))

    def test_ring_to_path_closes_and_drops_repeats(self):
        p = ring_to_path([(PROJ['lon0'], PROJ['lat1']), (PROJ['lon0'], PROJ['lat1']), (PROJ['lon0'] + 1, PROJ['lat1']), (PROJ['lon0'], PROJ['lat1'] - 1)])
        self.assertTrue(p.startswith('M0 0'))
        self.assertTrue(p.endswith('Z'))
        self.assertEqual(p.count('L'), 2)

    def test_every_destination_has_a_province(self):
        self.assertEqual(len(DEST_PROVINCES), 10)


if __name__ == '__main__':
    unittest.main()
