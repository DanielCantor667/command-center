CREATE TYPE "RenderJobStatus" AS ENUM ('queued', 'processing', 'completed', 'failed');

CREATE TABLE "scene_projects" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "currentRevisionId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "scene_projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scene_revisions" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "sceneVersion" INTEGER NOT NULL,
    "sceneJson" JSONB NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'editor',
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scene_revisions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "render_jobs" (
    "id" UUID NOT NULL,
    "revisionId" UUID NOT NULL,
    "requestedBy" UUID NOT NULL,
    "status" "RenderJobStatus" NOT NULL DEFAULT 'queued',
    "glbPath" TEXT,
    "pngPath" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    CONSTRAINT "render_jobs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "scene_projects_currentRevisionId_key" ON "scene_projects"("currentRevisionId");
CREATE INDEX "scene_projects_ownerId_updatedAt_idx" ON "scene_projects"("ownerId", "updatedAt" DESC);
CREATE UNIQUE INDEX "scene_revisions_projectId_revisionNumber_key" ON "scene_revisions"("projectId", "revisionNumber");
CREATE INDEX "scene_revisions_projectId_createdAt_idx" ON "scene_revisions"("projectId", "createdAt" DESC);
CREATE INDEX "render_jobs_revisionId_createdAt_idx" ON "render_jobs"("revisionId", "createdAt" DESC);
CREATE INDEX "render_jobs_status_createdAt_idx" ON "render_jobs"("status", "createdAt");

ALTER TABLE "scene_revisions"
  ADD CONSTRAINT "scene_revisions_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "scene_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scene_projects"
  ADD CONSTRAINT "scene_projects_currentRevisionId_fkey"
  FOREIGN KEY ("currentRevisionId") REFERENCES "scene_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "render_jobs"
  ADD CONSTRAINT "render_jobs_revisionId_fkey"
  FOREIGN KEY ("revisionId") REFERENCES "scene_revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "scene_projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "scene_revisions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "render_jobs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners_manage_scene_projects" ON "scene_projects"
  FOR ALL TO authenticated
  USING ("ownerId" = auth.uid())
  WITH CHECK ("ownerId" = auth.uid());

CREATE POLICY "owners_read_scene_revisions" ON "scene_revisions"
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "scene_projects"
    WHERE "scene_projects"."id" = "scene_revisions"."projectId"
      AND "scene_projects"."ownerId" = auth.uid()
  ));

CREATE POLICY "owners_create_scene_revisions" ON "scene_revisions"
  FOR INSERT TO authenticated
  WITH CHECK (
    "createdBy" = auth.uid()
    AND EXISTS (
      SELECT 1 FROM "scene_projects"
      WHERE "scene_projects"."id" = "scene_revisions"."projectId"
        AND "scene_projects"."ownerId" = auth.uid()
    )
  );

CREATE POLICY "owners_read_render_jobs" ON "render_jobs"
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM "scene_revisions"
    JOIN "scene_projects" ON "scene_projects"."id" = "scene_revisions"."projectId"
    WHERE "scene_revisions"."id" = "render_jobs"."revisionId"
      AND "scene_projects"."ownerId" = auth.uid()
  ));

CREATE POLICY "owners_create_render_jobs" ON "render_jobs"
  FOR INSERT TO authenticated
  WITH CHECK (
    "requestedBy" = auth.uid()
    AND EXISTS (
      SELECT 1 FROM "scene_revisions"
      JOIN "scene_projects" ON "scene_projects"."id" = "scene_revisions"."projectId"
      WHERE "scene_revisions"."id" = "render_jobs"."revisionId"
        AND "scene_projects"."ownerId" = auth.uid()
    )
  );
