import Typography, { TypographyProps } from "@/ui/components/Typography";
import { ElementType, parseDocument } from "htmlparser2";
import { ChildNode } from "domhandler";
import { ColorValue, TouchableOpacity } from "react-native";
import * as ExpoWebBrowser from "expo-web-browser";
import { useTheme } from "@react-navigation/native";

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
};

const RenderHTMLComponent = (child: ChildNode, index: number, parentProps: TypographyProps, listTag?: "ul" | "ol" = undefined, isInLi: boolean = false) => {
  const { colors } = useTheme();

  const style = (child.attribs?.style || "")
    .split(";")
    .map(s => {
      const [key, value] = s.split(":").map(part => part.trim());
      return { key, value };
    })
    .reduce((acc, { key, value }) => {
      if (key && value) {
        acc[key as keyof React.CSSProperties] = value;
      }
      return acc;
    }, {} as React.CSSProperties)
  ;

  const renderChildren = () => {
    return (
      <>
        {child.children.map((c, i) => RenderHTMLComponent(
          c, i,
          cleanParentsProps({
            ...parentProps,
            weight: child.tagName === "a" ? "bold" : (child.name === "b" || child.name === "strong" ? "bold" : parentProps.weight),
            color: child.tagName === "a" ? colors.primary : (style.color as TypographyProps["color"] || parentProps.color),
            align: style["text-align"] as TypographyProps["align"] || parentProps.align,
            style: {
              backgroundColor: style["background-color"] as ColorValue || parentProps.style?.backgroundColor,
              fontStyle: child.name === "i" || child.name === "em" ? "italic" : parentProps.style?.fontStyle,
              textDecorationLine: child.name === "u" || style["text-decoration"] === "underline" ? "underline" : parentProps.style?.textDecorationLine,
              fontSize: style["font-size"] ? parseInt(style["font-size"].replace("px", "")) * 1.2307692308 : parentProps.style?.fontSize,
            },
          }),
          child.tagName === "ul" || child.tagName === "ol" ? child.tagName : listTag,
          child.tagName === "li" ? true : isInLi,
        ))}
      </>
    );
  };


  switch (child.type) {
    case ElementType.Text:
      return (
        <Typography
          key={index}
          weight={parentProps.weight}
          style={{
            fontWeight: parentProps.weight,
            fontStyle: parentProps.style?.fontStyle,
            backgroundColor: parentProps.style?.backgroundColor,
            textDecorationLine: parentProps.style?.textDecorationLine,
            fontSize: parentProps.style?.fontSize,
          }}
          color={style.color as TypographyProps["color"] || parentProps.color}
          align={style["text-align"] as TypographyProps["align"] || parentProps.align}
        >
          { (listTag && isInLi ? "  - ":"") + child.data}
        </Typography>
      );
    case ElementType.Tag:

      return (
        <Typography
          key={index}
        >
          {child.tagName === "a" ? (
            <TouchableOpacity
              onPress={() => {
                if (child.attribs?.href) {
                  ExpoWebBrowser.openBrowserAsync(child.attribs.href, {
                    enableBarCollapsing: true,
                    presentationStyle: ExpoWebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
                  });
                }
              }}
            >
              <Typography
                style={{ textDecorationLine: "underline" }}
              >
                {renderChildren(child.children)}
              </Typography>
            </TouchableOpacity>
          ) : renderChildren(child.children)}
        </Typography>
      );
    default:
      return null;
  }
};

const HTMLTypography = (props: HTMLTypographyProps) => {
  const dom = parseDocument(props.children);

  console.log(props.children);

  return <Typography>{dom.children.map((c, i) => RenderHTMLComponent(c, i, {}))}</Typography>;
};

export default HTMLTypography;