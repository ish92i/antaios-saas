"use node";

import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { antaiosTailwindConfig } from "../antaios_theme";

interface AntaiosLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export function AntaiosLayout({ previewText, children }: AntaiosLayoutProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = antaiosTailwindConfig
  return (
    <Tailwind config={config}>
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </Head>
        <Body className="bg-canvas text-14 font-inter text-fg m-0 p-0">
          <Preview>{previewText}</Preview>
          <Container className="mx-auto max-w-[640px] px-4 pt-16 pb-6">
            <Section className="rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <Section className="bg-bg border-stroke rounded-[8px] border">
                <Section className="mobile:px-6! px-10 pt-10 pb-14">
                  {children}
                </Section>

                <Section className="border-stroke border-t px-10 py-16">
                  <Text className="text-13 font-inter text-fg-3 m-0 max-w-[320px]">
                    Antaios helps you manage EUDR compliance — from supplier
                    data collection to regulatory filing.
                  </Text>

                  <Row align="left">
                    <Column className="w-full pt-8 align-top">
                      <Text className="text-11 font-inter text-fg-2 m-0">
                        <Link href="https://app.antaios.fr" className="text-fg-2">
                          app.antaios.fr
                        </Link>
                      </Text>
                    </Column>
                  </Row>
                </Section>
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
