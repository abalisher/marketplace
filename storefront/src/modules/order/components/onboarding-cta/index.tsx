"use client"

import { resetOnboardingState } from "@lib/data/onboarding"
import { Button, Container, Text } from "@medusajs/ui"
import { useMessages } from "@lib/i18n/i18n-context"

const OnboardingCta = ({ orderId }: { orderId: string }) => {
  const m = useMessages()
  return (
    <Container className="max-w-4xl h-full bg-ui-bg-subtle w-full">
      <div className="flex flex-col gap-y-4 center p-4 md:items-center">
        <Text className="text-ui-fg-base text-xl">
          {m.order.testOrderCreated}
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          {m.order.completeSetupPrompt}
        </Text>
        <Button
          className="w-fit"
          size="xlarge"
          onClick={() => resetOnboardingState(orderId)}
        >
          {m.order.completeSetupButton}
        </Button>
      </div>
    </Container>
  )
}

export default OnboardingCta
