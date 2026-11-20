"use client";

import { useState } from "react";
import Toolbar from "@/components/toolbar/Toolbar";
import ToolsPanel from "@/components/panels/ToolsPanel";
import PropertiesPanel from "@/components/panels/PropertiesPanel";
import LayersPanel from "@/components/panels/LayersPanel";
import DesignCanvas from "@/components/canvas/DesignCanvas";
import TemplateGallery from "@/components/panels/TemplateGallery";

export default function Home() {
  const [templatesOpen, setTemplatesOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-100 text-neutral-900">
      <Toolbar onOpenTemplates={() => setTemplatesOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <ToolsPanel />
        <DesignCanvas />
        <PropertiesPanel />
      </div>
      <div className="border-t border-neutral-200">
        <LayersPanel />
      </div>
      <TemplateGallery open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
    </div>
  );
}
