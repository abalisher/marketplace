import { Button, Drawer, Label, StatusBadge, Text, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"
import {
  AdminDispute,
  DISPUTE_CATEGORY_META,
  DISPUTE_STATUS_META,
  DISPUTE_TRANSITIONS,
  DisputeStatus,
} from "../lib/reviews"
import { useReviews } from "../hooks/use-reviews"

type DisputeTransitionDrawerProps = {
  dispute: AdminDispute | null
  onClose: () => void
}

const ACTION_LABEL: Record<DisputeStatus, string> = {
  open: "Reopen",
  in_review: "Take in review",
  resolved: "Resolve",
  rejected: "Reject",
}

// Drawer ведения диспута оператором: детали + кнопки доступных переходов
// (по стейт-машине) + поле резолюции (обязательно для resolved/rejected).
const DisputeTransitionDrawer = ({
  dispute,
  onClose,
}: DisputeTransitionDrawerProps) => {
  const { transitionDispute } = useReviews()
  const [resolution, setResolution] = useState("")

  useEffect(() => {
    if (dispute) {
      setResolution(dispute.resolution ?? "")
    }
  }, [dispute])

  if (!dispute) {
    return null
  }

  const transitions = DISPUTE_TRANSITIONS[dispute.status]
  const statusMeta = DISPUTE_STATUS_META[dispute.status]

  const run = (to: DisputeStatus) => {
    // Резолюция обязательна при закрытии (resolved/rejected).
    const needsResolution = to === "resolved" || to === "rejected"
    if (needsResolution && resolution.trim() === "") {
      return
    }
    transitionDispute.mutate(
      { id: dispute.id, to, resolution: resolution.trim() || undefined },
      { onSuccess: onClose }
    )
  }

  const resolutionMissing = resolution.trim() === ""

  return (
    <Drawer open={!!dispute} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Dispute</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-6 overflow-y-auto">
          <div className="flex items-center gap-x-2">
            <StatusBadge color={statusMeta.color}>
              {statusMeta.label}
            </StatusBadge>
            <Text size="small" className="text-ui-fg-subtle">
              {DISPUTE_CATEGORY_META[dispute.category].label}
            </Text>
          </div>
          <div className="flex flex-col gap-y-1">
            <Label>Description</Label>
            <Text size="small" className="text-ui-fg-subtle">
              {dispute.description}
            </Text>
          </div>
          {transitions.length > 0 ? (
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="dispute-resolution">Resolution</Label>
              <Textarea
                id="dispute-resolution"
                value={resolution}
                onChange={(event) => setResolution(event.target.value)}
                placeholder="Required to resolve or reject"
              />
            </div>
          ) : (
            <Text size="small" className="text-ui-fg-subtle">
              This dispute is closed.
              {dispute.resolution ? ` Resolution: ${dispute.resolution}` : ""}
            </Text>
          )}
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="small" variant="secondary">
              Close
            </Button>
          </Drawer.Close>
          {transitions.map((to) => {
            const disabled =
              transitionDispute.isPending ||
              ((to === "resolved" || to === "rejected") && resolutionMissing)
            return (
              <Button
                key={to}
                size="small"
                variant={to === "rejected" ? "danger" : "primary"}
                disabled={disabled}
                onClick={() => run(to)}
              >
                {ACTION_LABEL[to]}
              </Button>
            )
          })}
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export default DisputeTransitionDrawer
