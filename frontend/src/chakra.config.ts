import { mode } from "@chakra-ui/theme-tools";

interface Props {
  [key: string]: any;
}

export const styles = {
  global: (props: Props) => ({
    body: {
      color: mode("gray.800", "whiteAlpha.900")(props),
      bg: mode("gray.100", "#101010")(props),
    },
  }),
};

export const config = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

export const colors = {
  gray: {
    light: "#616161",
    dark: "#1e1e1e",
  },
};
