import ContentText from '~/components/flex/content/ContentText'

export default function Privacy() {
  return (
    <ContentText
      heading="h1"
      title="Privacy statement"
      description="This page says what happens when you visit timosmit.dev or send a message with the contact form."
      image="/images/timosmit.webp"
      updated="20 August 2026"
      sections={[
        {
          title: 'Who I am',
          body: <p>I am Timo Smit, a front-end developer. This site is my portfolio.</p>
        },
        {
          title: 'Messages you send',
          body: (
            <p>
              If you use the contact form, Web3Forms receives your name, email address, and message so I can reply. I do not sell that
              information or use it for ads. If you want a message deleted, say so in a new message and I will remove it.
            </p>
          )
        },
        {
          title: 'Cookies',
          body: (
            <p>
              This site does not set tracking cookies. The contact form is a POST to Web3Forms. You can use the site without sending a
              message.
            </p>
          )
        }
      ]}
    />
  )
}
