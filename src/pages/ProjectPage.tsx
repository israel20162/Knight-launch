import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { db } from "../db/db";
import type { Project } from "../db/models/Project";
import type { Screenshot } from "../db/models/Screenshot";

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [screenshots, setScreenshots] = useState<
    (Screenshot & { imageUrl: string })[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (!projectId) throw new Error("No project ID provided");
        const numericProjectId = parseInt(projectId, 10);
        const fetchedProject = await db.projects.get(numericProjectId);
        if (!fetchedProject) throw new Error("Project not found");
        setProject(fetchedProject);

        const fetchedScreenshots = await db.screenshots
          .where("projectId")
          .equals(numericProjectId)
          .toArray();

        // setScreens(fetchedScreenshots)

        // Create temporary URLs for Blob objects
        const screenshotsWithUrls = fetchedScreenshots.map((screenshot) => ({
          ...screenshot,
          imageUrl: URL.createObjectURL(screenshot.baseImage),
        }));
        setScreenshots(screenshotsWithUrls);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
    return () => {
      screenshots.forEach((screenshot) =>
        URL.revokeObjectURL(screenshot.imageUrl)
      );
    };
  }, [projectId]);

  if (loading) return <div className="p-4">Loading project...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!project) return <div className="p-4">Project not found</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">{project.name} </h1>
      <p className="mb-4">
        Orientation: {project.orientation} | Created:{" "}
        {project.createdAt.toLocaleString()} | Updated:{" "}
        {project.updatedAt.toLocaleString()}
      </p>
      <div className="mb-6"></div>
      <div className="flex justify-evenly gap-6 w-full max-w-screen no-scrollbar overflow-x-scroll">
        {screenshots.map((screenshot) => (
          <div key={screenshot.id} className="relative w-full h-auto">
            {/* Device Frame Container */}
            <div
              className="relative bg-gray-200 rounded-lg shadow-lg overflow-hidden"
              style={{
                paddingTop: "calc(100% * (2280 / 1080))", // Aspect ratio example (Pixel 4)
                backgroundImage: `url(/frames/${screenshot?.deviceFrame
                  ?.replace(" ", "-")
                  .toLowerCase()}.png)`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            >
              {/* Screenshot Image */}
              <img
                src={screenshot.imageUrl}
                alt={`${project.name} Screenshot ${screenshot.id}`}
                className="absolute top-4 left-2 right-2 w-[90%] h-[90%] object-contain"
              />
            </div>
            <p className="mt-2 text-center text-sm">
              Device: {screenshot.deviceFrame}
            </p>
          </div>
        ))}
        {screenshots.map((screenshot) => (
          <div key={screenshot.id} className="relative w-full h-auto">
            {/* Device Frame Container */}
            <div
              className="relative bg-gray-200 rounded-lg shadow-lg overflow-hidden"
              style={{
                paddingTop: "calc(100% * (2280 / 1080))", // Aspect ratio example (Pixel 4)
                backgroundImage: `url(/frames/${screenshot?.deviceFrame
                  ?.replace(" ", "-")
                  .toLowerCase()}.png)`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            >
              {/* Screenshot Image */}
              <img
                src={screenshot.imageUrl}
                alt={`${project.name} Screenshot ${screenshot.id}`}
                className="absolute top-4 left-2 right-2 w-[90%] h-[90%] object-contain"
              />
            </div>
            <p className="mt-2 text-center text-sm">
              Device: {screenshot.deviceFrame}
            </p>
          </div>
        ))}
      </div>
      {screenshots.length === 0 && (
        <p className="text-center">No screenshots available.</p>
      )}
    </div>
  );
};

export default ProjectPage;
