import Typography, { TypographyProps } from "@/ui/components/Typography";
import { ElementType, parseDocument } from "htmlparser2";
import { ChildNode } from "domhandler";

interface HTMLTypographyProps extends TypographyProps {
  children: string;
}

const cleanParentsProps = (props: TypographyProps): TypographyProps => {
  const keys = Object.keys(props) as (keyof TypographyProps)[];
  const cleanedProps: TypographyProps = {};
  keys.forEach((key) => {
    if (props[key] !== undefined) {
      cleanedProps[key] = props[key];
    }
  });
  return cleanedProps;
}

const RenderHTMLComponent = (child: ChildNode, index: number, parentProps: TypographyProps) => {
  switch (child.type) {
    case ElementType.Text:
      return (
        <Typography
          key={index}
          weight={parentProps.weight}
          style={{fontWeight: parentProps.weight}}
        >
          {child.data}
        </Typography>
      );
    case ElementType.Tag:
      return (
        <Typography
          key={index}
        >
          {child.children.map((c , i) => RenderHTMLComponent(c, i, cleanParentsProps({
            ...parentProps,
            weight: child.name === "b" || child.name === "strong" ? "bold" : parentProps.weight,
          })))}
        </Typography>
      );
    default:
      return null;
  }
};

const HTMLTypography = (props: HTMLTypographyProps) => {
  const dom = parseDocument(props.children);

  return <Typography>{dom.children.map((c, i) => RenderHTMLComponent(c, i, {}))}</Typography>;
};

export default HTMLTypography;