import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getServerMessages } from "@lib/i18n/server"

const SignInPrompt = async () => {
  const m = await getServerMessages()
  return (
    <div className="bg-white flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge">
          {m.cart.signInTitle}
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2">
          {m.cart.signInSubtitle}
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10" data-testid="sign-in-button">
            {m.cart.signIn}
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
