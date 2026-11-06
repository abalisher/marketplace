import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function TenantLayout(props: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface selection:bg-accent selection:text-on-accent">
      {props.children}
    </div>
  )
}
