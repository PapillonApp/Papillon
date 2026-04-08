#!/bin/bash

UNICODE_EMOJI_DATA=$(curl https://unicode.org/Public/emoji/latest/emoji-test.txt);
IS_FIRST_GROUP=0;

get_icon() {
  case "$1" in
    smileys_and_emotion) echo "Emoji" ;;
    people_and_body) echo "Accessibility" ;;
    component) echo "Code" ;;
    animals_and_nature) echo "Butterfly" ;;
    food_and_drink) echo "Cutlery" ;;
    travel_and_places) echo "Bus" ;;
    activities) echo "Palette" ;;
    objects) echo "Archive" ;;
    symbols) echo "Grid" ;;
    flags) echo "MapPin" ;;
    *) echo "" ;;
  esac
}

echo 'export const UnicodeEmojis = {'

while IFS= read -r line; do
  if [[ "$line" == "# group: "* ]]; then
    GROUP=${line##*: }
    FORMATED_GROUP_NAME=$(echo "$GROUP" \
      | tr '[:upper:]' '[:lower:]' \
      | sed 's/&/and/g; s/[^a-z0-9]/_/g; s/__*/_/g; s/^_//; s/_$//')
    ICON=$(get_icon "$FORMATED_GROUP_NAME")

    if [ "$IS_FIRST_GROUP" -eq 1 ]; then
      echo -e ']\n\t},'
    fi

    echo -ne "\t$FORMATED_GROUP_NAME: { \n\t\ticon: \"$ICON\",\n\t\temojis: ["

    IS_FIRST_GROUP=1
  fi

  if [[ "$line" == *"; fully-qualified"* ]]; then
    EMOJI_LINE=("$line")
    EMOJI_HEX=${EMOJI_LINE[0]};
    echo -n "0x$EMOJI_HEX, "
  fi
done <<< "$UNICODE_EMOJI_DATA"

echo -e ']\n\t}\n};';