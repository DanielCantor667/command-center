import { z } from 'zod';

export const spatialRulesSchema = z.object({
  circulation: z.object({
    mainCorridorWidthM: z.number(),
    secondaryCorridorWidthM: z.number(),
    minTurningRadiusM: z.number(),
  }),
  furniture: z.object({
    deskSeparationM: z.number(),
    chairClearanceM: z.number(),
    monitorDistanceM: z.number(),
  }),
  meeting: z.object({
    small: z.object({ capacity: z.string(), minAreaSqm: z.number() }),
    medium: z.object({ capacity: z.string(), minAreaSqm: z.number() }),
    large: z.object({ capacity: z.string(), minAreaSqm: z.number() }),
  }),
  accessibility: z.object({
    minDoorWidthM: z.number(),
    wheelchairTurningRadiusM: z.number(),
    accessibleDeskClearanceM: z.number(),
  }),
  safety: z.object({
    minEmergencyExitWidthM: z.number(),
    maxDistanceToExitM: z.number(),
    minFireExtinguisherSpacingM: z.number(),
  }),
  planning: z.object({
    maxPeoplePerOpenWorkspace: z.number(),
    peoplePerMeetingRoom: z.number(),
    peoplePerExecutiveOffice: z.number(),
    peoplePerPhoneBooth: z.number(),
    peoplePerBreakRoom: z.number(),
  }),
});

export type SpatialRules = z.infer<typeof spatialRulesSchema>;

export const SPATIAL_RULES: SpatialRules = {
  circulation: {
    mainCorridorWidthM: 1.5,
    secondaryCorridorWidthM: 1.0,
    minTurningRadiusM: 1.5,
  },
  furniture: {
    deskSeparationM: 1.2,
    chairClearanceM: 0.75,
    monitorDistanceM: 0.6,
  },
  meeting: {
    small: { capacity: '2-4', minAreaSqm: 8 },
    medium: { capacity: '5-8', minAreaSqm: 16 },
    large: { capacity: '9-16', minAreaSqm: 30 },
  },
  accessibility: {
    minDoorWidthM: 0.9,
    wheelchairTurningRadiusM: 1.5,
    accessibleDeskClearanceM: 1.5,
  },
  safety: {
    minEmergencyExitWidthM: 1.1,
    maxDistanceToExitM: 30,
    minFireExtinguisherSpacingM: 25,
  },
  planning: {
    maxPeoplePerOpenWorkspace: 60,
    peoplePerMeetingRoom: 12,
    peoplePerExecutiveOffice: 25,
    peoplePerPhoneBooth: 15,
    peoplePerBreakRoom: 30,
  },
};
