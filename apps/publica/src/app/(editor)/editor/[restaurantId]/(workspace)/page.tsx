import { EditorWorkspaceScreen } from "@/features/page-builder/editor/EditorWorkspaceScreen";

export default async function EditorPage({ params }: PageProps<"/editor/[restaurantId]">) {
  const { restaurantId: segment } = await params;
  const restaurantId = decodeURIComponent(segment);

  return <EditorWorkspaceScreen restaurantId={restaurantId} />;
}
