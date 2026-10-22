import { Stack } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";

const SearchView: React.FC = () => {
  return (
    <>
      <Stack.Title>Search</Stack.Title>
      <Stack.SearchBar placement="automatic" placeholder="Search" onChangeText={() => {}} />
      <ScrollView>

      </ScrollView>
    </>
  )
};

export default SearchView;