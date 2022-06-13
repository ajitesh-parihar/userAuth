import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import randomWords from "random-words";
import TestPage from "./testPage";
import UserPage from "./userPage";

const url = "192.168.0.111";
const port = "3000";

export default function App() {
  return <UserPage />;
  // return <TestPage />;
}
