import React from 'react';
import Link from "next/link";
import { cookies } from "next/headers";
import WorkflowBuilderClient from "./WorkflowBuilderClient";
import enWorkflow from "../../../i18n/locales/en/workflow.json";
import zhWorkflow from "../../../i18n/locales/zh/workflow.json";
import { getServerApiBaseUrl } from "../../lib/serverApi";

const workflowResourcesByLang = {
  en: enWorkflow,
  zh: zhWorkflow,
};

const getLocaleResources = (lang) => {
  const normalizedLang = lang?.toLowerCase().startsWith("en") ? "en" : "zh";
  return workflowResourcesByLang[normalizedLang];
};
async function fetchWorkflowData(id, cookieHeader) {
  const baseUrl = `${getServerApiBaseUrl()}/api/workflow`;
  try {
    const [workflowRes, schemasRes] = await Promise.all([
      fetch(`${baseUrl}/get-workflow-def/${id}`, {
        cache: 'no-store',
        headers: { 'Cookie': cookieHeader || '' }
      }),
      fetch(`${baseUrl}/${id}/node-schemas`, {
        cache: 'no-store',
        headers: { 'Cookie': cookieHeader || '' }
      })
    ]);

    const initialWorkflowData = workflowRes.ok ? await workflowRes.json() : null;
    const initialNodeSchemas = schemasRes.ok ? await schemasRes.json() : null;

    return { initialWorkflowData, initialNodeSchemas };
  } catch (error) {
    console.error("Error fetching workflow data on server:", error);
    return { initialWorkflowData: null, initialNodeSchemas: null };
  }
}

export async function generateMetadata() {
  const cookieStore = await cookies();
  const resources = getLocaleResources(cookieStore.get("i18n_lang")?.value);

  return {
    title: resources.detailPageTitle,
    description: resources.detailPageDescription,
  };
}

export default async function WorkflowPage({ params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const resources = getLocaleResources(cookieStore.get("i18n_lang")?.value);

  const { initialWorkflowData, initialNodeSchemas } = await fetchWorkflowData(id, cookieHeader);

  if (!initialWorkflowData || !initialNodeSchemas) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-black tracking-tight">
            {resources.workflowLoadFailedTitle}
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {resources.workflowLoadFailedDescription}
          </p>
          <Link
            href="/workflow"
            aria-label={resources.workflowLoadFailedBackAria}
            className="mt-6 inline-flex rounded-full bg-white/10 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-white/15"
          >
            {resources.backToWorkflowList}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full bg-black">
      <WorkflowBuilderClient 
        initialWorkflowData={initialWorkflowData} 
        initialNodeSchemas={initialNodeSchemas} 
      />
    </div>
  );
}
