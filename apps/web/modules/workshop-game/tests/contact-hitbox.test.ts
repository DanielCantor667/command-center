import { Box3, Ray, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { LAB_ANCHORS } from '../lab-anchors';
import { CONTACT_DESK } from '../lab';
import { STATIONS } from '../stations';

describe('contact desk hit area', () => {
  it('leaves the monitor unobstructed from the contact camera while keeping the desktop clickable', () => {
    const box = new Box3().setFromCenterAndSize(new Vector3(...CONTACT_DESK.position), new Vector3(...CONTACT_DESK.size));
    const camera = new Vector3(...STATIONS.contact.view.position);
    const monitor = LAB_ANCHORS.screen_contact!;
    for (const offset of [-.45, 0, .45]) {
      const target = new Vector3(...monitor.position).add(new Vector3(0, offset * monitor.size[1], 0));
      const ray = new Ray(camera, target.clone().sub(camera).normalize());
      const hit = ray.intersectBox(box, new Vector3());
      expect(hit === null || hit.distanceTo(camera) > target.distanceTo(camera)).toBe(true);
    }
    const desktop = new Vector3(3.55, .74, -2.4);
    expect(new Ray(camera, desktop.sub(camera).normalize()).intersectBox(box, new Vector3())).not.toBeNull();
  });
});
