import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  getWatchlist,
  setWatchlist,
  login,
  signUp,
  logout,
} from "./userFunctions";

export default function UserPage() {
  const [data, setData] = useState({
    username: "",
    watchlist: [],
  });
  const [tokens, setTokens] = useState([]);
  const [inputData, setInputData] = useState({
    username: "",
    password: "",
    watchlist: "",
  });
  // : {
  //   id: null,
  //   username: null,
  //   password: null,
  //   watchlist: null,
  // }

  const usernameInputChange = (username) => {
    setInputData({
      ...inputData,
      username: username,
    });
  };

  const passwordInputChange = (password) => {
    setInputData({
      ...inputData,
      password: password,
    });
  };

  const watchlistInputChange = (watchlist) => {
    setInputData({
      ...inputData,
      watchlist: watchlist,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      {data.username?.length != 0 && (
        <Text style={{ color: "#fff", fontSize: 26 }}>Details:</Text>
      )}
      {data.username?.length == 0 && (
        <Text style={{ color: "#fff", fontSize: 26 }}>No data found</Text>
      )}
      <View
        style={{
          height: "20%",
          width: "100%",
          paddingVertical: "1%",
          alignItems: "center",
          backgroundColor: "#eee",
        }}
      >
        {data && (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              borderBottomWidth: 1,
              minHeight: "18%",
              width: "70%",
              backgroundColor: "#333",
            }}
          >
            <Text style={styles.text}>{`username: ${data.username}`}</Text>
            {data.watchlist !== undefined && (
              <Text style={styles.text}>{`watchlist: ${JSON.stringify(
                data.watchlist
              )
                .split(",")
                .join(", ")}`}</Text>
            )}
          </View>
        )}
      </View>
      <View>
        <View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.TextInput}
              placeholder="Username"
              onChangeText={(username) => usernameInputChange(username)}
            />
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.TextInput}
              secureTextEntry={true}
              placeholder="Password"
              onChangeText={(password) => passwordInputChange(password)}
            />
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.TextInput}
              secureTextEntry={true}
              placeholder="Watchlist"
              onChangeText={(watchlist) => watchlistInputChange(watchlist)}
            />
          </View>
        </View>
        <View style={{ flexDirection: "row", marginTop: "10%" }}>
          <Pressable
            style={[
              {
                backgroundColor: "#3af",
              },
              styles.pressable,
            ]}
            onPress={async () => {
              getWatchlist(tokens, setTokens, data, setData);
            }}
          >
            <Text>Fetch</Text>
          </Pressable>
          <Pressable
            style={[
              {
                backgroundColor: "#3af",
              },
              styles.pressable,
            ]}
            onPress={async () => {
              setWatchlist(inputData, tokens, setTokens);
            }}
          >
            <Text>Set</Text>
          </Pressable>
          <Pressable
            style={[
              {
                backgroundColor: "#6fb",
              },
              styles.pressable,
            ]}
            onPress={() => {
              login(inputData, setTokens, data, setData);
            }}
          >
            <Text>Login</Text>
          </Pressable>
          <Pressable
            style={[
              {
                backgroundColor: "#6fb",
              },
              styles.pressable,
            ]}
            onPress={() => {
              signUp(inputData);
            }}
          >
            <Text>Signup</Text>
          </Pressable>
          <Pressable
            style={[
              {
                backgroundColor: "#f44",
              },
              styles.pressable,
            ]}
            onPress={() => {
              logout(tokens.refreshToken, setData);
            }}
          >
            <Text>Logout</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  flatList: {
    backgroundColor: "#333",
    flexGrow: 0,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    textAlign: "center",
  },
  TextInput: {
    height: 50,
    padding: 10,
    margin: 5,
    color: "#000",
    backgroundColor: "#fff",
  },
  pressable: {
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
  },
});
