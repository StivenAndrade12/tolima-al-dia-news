import { createFileRoute } from "@tanstack/react-router";
import { NewsForm } from "@/components/news-form";

export const Route = createFileRoute("/admin/nueva")({ component: () => <NewsForm /> });
