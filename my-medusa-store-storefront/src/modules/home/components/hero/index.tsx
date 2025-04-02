import { Github } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"

const Hero = () => {
  return (
    // <div
    //   className="h-[140vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle bg-cover bg-center bg-no-repeat"
    //   style={{
    //     backgroundImage: "url('https://free-vectors.net/_ph/6/723284501.jpg')",
    //     backgroundSize: "cover",
    //     backgroundPosition: "center",
    //   }}
    // >

    <div
      className="h-[90vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/premium-vector/chatbot-blue-background-artificial-intelligence-concept-vector-illustration_319430-71.jpg?w=1060')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="absolute inset-0 z-10 flex justify-end items-center p-10 "
        style={{ right: "100px" }}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center min-h-[500px]">
          <Heading
            level="h1"
            className="text-3xl font-extrabold mb-4 text-gray-800"
          >
            Enterprise Package
          </Heading>
          <p className="text-lg font-light mb-6 text-gray-600">
            Custom-designed based on each business’s unique needs, providing a
            specialized and flexible chatbot solution for large companies.
          </p>
          <ul className="text-left text-gray-700 mb-6">
            <li className="mb-2">
              <span className="mr-2 text-black">&#10003;</span>{" "}
              <strong>Flexible:</strong> Easily customizable to meet specific
              business requirements.
            </li>
            <li className="mb-2">
              <span className="mr-2 text-black">&#10003;</span>{" "}
              <strong>Scalable:</strong> Supports high user volumes with optimal
              performance.
            </li>
            <li className="mb-2">
              <span className="mr-2 text-black">&#10003;</span>{" "}
              <strong>Extendable:</strong> Can be enhanced with additional
              features and integrations as needed.
            </li>
            <li className="mb-2">
              <span className="mr-2 text-black">&#10003;</span>{" "}
              <strong>Secure:</strong> Implements robust security measures to
              protect data and privacy.
            </li>
          </ul>
          <Button
            variant="primary"
            className="transition-fg relative inline-flex items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] shadow-buttons-neutral text-ui-fg-base bg-ui-button-neutral after:button-neutral-gradient hover:bg-ui-button-neutral-hover hover:after:button-neutral-hover-gradient active:bg-ui-button-neutral-pressed active:after:button-neutral-pressed-gradient focus-visible:shadow-buttons-neutral-focus txt-compact-small-plus gap-x-1.5 px-3 py-1.5 w-full h-10"
          >
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Hero
