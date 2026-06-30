/* eslint-disable react-refresh/only-export-components */
import { render } from "@react-email/render";
import { Section, Text, Link, Button } from "@react-email/components";
import { AntaiosLayout } from "./components/AntaiosLayout";

type SupplierEmailOptions = {
  supplierLink: string;
};

export function SupplierNotificationEmail({ supplierLink }: SupplierEmailOptions) {
  return (
    <AntaiosLayout previewText="Informations complémentaires requises">
      <Section align="left" className="w-full max-w-[480px] text-left">
        <Text className="text-24 text-fg m-0 font-sans font-semibold">
          Informations complémentaires requises
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-5">
          Bonjour,
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-3">
          Un opérateur vous demande de fournir des informations
          complémentaires pour compléter un dossier de conformité EUDR.
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-3">
          Veuillez cliquer sur le bouton ci-dessous pour fournir les
          informations demandées :
        </Text>
      </Section>

      <Section align="left" className="mt-8">
        <Button
          href={supplierLink}
          className="bg-brand text-14 font-inter text-fg-inverted inline-block rounded-md border-none px-5 py-3 text-center"
        >
          Fournir les informations
        </Button>
      </Section>

      <Section align="left" className="mt-10">
        <Text className="text-14 font-inter text-fg-2 m-0">
          Ou copiez ce lien dans votre navigateur :
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-2 break-all">
          <Link href={supplierLink} className="text-brand">
            {supplierLink}
          </Link>
        </Text>
      </Section>

      <Section align="left" className="mt-8">
        <Text className="text-14 font-inter text-fg-2 m-0">
          Merci de votre collaboration.
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-3">
          L&apos;équipe Antaios
        </Text>
      </Section>
    </AntaiosLayout>
  );
}

export async function renderSupplierEmail(args: SupplierEmailOptions) {
  return await render(<SupplierNotificationEmail {...args} />);
}
