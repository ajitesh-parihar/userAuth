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

const url = "192.168.0.111";
const port = "3000";

export default function TestPage() {
  const [data, setData] = useState([]);
  const [fetchNotice, setFetchNotice] = useState([]);
  // : {
  //   id: null,
  //   username: null,
  //   password: null,
  //   watchlist: null,
  // }
  // let fetchData = async () =>{
  //   try{
  //     const res = await fetch(`http://${url}:${port}/`);
  //     // console.log(res);
  //     result = await res.json();
  //     let newData = []
  //     result.forEach(element => {
  //       newData.push(element);
  //     });
  //     setData(newData);
  //   } catch(e){
  //     console.log(e);
  //   }
  // }

  // let getAndSetData = async () => {
  //   try{
  //     let response = await fetchData();
  //     // console.log(typeof response);
  //     let newData = []
  //     response.forEach(element => {
  //       newData.push(element);
  //     });
  //     // console.log(response);
  //     setData(newData);
  //   } catch(e){
  //     console.log(e);
  //   }
  // }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://${url}:${port}/`);
        // console.log(res);
        result = await res.json();
        let newData = [];
        result.forEach((element) => {
          newData.push(element);
        });
        setData(newData);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [fetchNotice]);

  const addUser = async (newDetails) => {
    // console.log(newDetails);
    try {
      const response = await fetch(`http://${url}:${port}/signup`, {
        method: "POST",
        headers: new Headers({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(newDetails),
      });
      const result = await response.text();
      console.log(result);
    } catch (e) {
      console.log(e);
    }
    setFetchNotice((prev) => !prev);
  };

  const update = async (username, watchlist) => {
    if (!username || !watchlist) {
      console.log("undefined update");
      return;
    }
    try {
      const response = await fetch(`http://${url}:${port}/update`, {
        method: "POST",
        headers: new Headers({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ username, watchlist }),
      });
      const result = await response.text();
      console.log(result);
    } catch (e) {
      console.log(e);
    }
    setFetchNotice((prev) => !prev);
  };

  const dropUsers = async () => {
    try {
      const response = await fetch(`http://${url}:${port}/drop`, {
        method: "POST",
      });
      const result = await response.text();
      console.log(result);
    } catch (e) {
      console.log(e);
    }
    setFetchNotice((prev) => !prev);
  };

  // console.log(data);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      {data.length != 0 && (
        <Text style={{ color: "#fff", fontSize: 26 }}>Details:</Text>
      )}
      {data.length == 0 && (
        <Text style={{ color: "#fff", fontSize: 26 }}>No data found</Text>
      )}
      <View
        style={{
          height: "50%",
          width: "100%",
          paddingVertical: "1%",
          alignItems: "center",
          backgroundColor: "#eee",
        }}
      >
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <View
              style={{
                alignItems: "center",
                marginBottom: 10,
                borderBottomWidth: 1,
                paddingVertical: "10%",
                width: "70%",
              }}
            >
              <Text style={styles.text}>{`id: ${item.id}`}</Text>
              <Text style={styles.text}>{`username: ${item.username}`}</Text>
              <Text style={styles.text}>{`password: ${item.password}`}</Text>
              <Text style={styles.text}>{`watchlist: ${JSON.stringify(
                item.watchlist
              )
                .split(",")
                .join(", ")}`}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.flatList}
          // style={styles.flatList}
        />
      </View>
      <View style={{ flexDirection: "row", marginTop: "10%" }}>
        <Pressable
          style={{
            backgroundColor: "#6fb",
            borderRadius: 10,
            padding: 10,
            marginHorizontal: 10,
          }}
          onPress={() => {
            console.log("calling add");
            addUser({
              username: randomWords(),
              password: [
                randomWords(),
                parseInt(Math.random() * 999).toString(),
              ].join(""),
            });
          }}
        >
          <Text>Add</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: "#6fb",
            borderRadius: 10,
            padding: 10,
            marginHorizontal: 10,
          }}
          onPress={() => {
            // console.warn(data[0].username);
            console.log("calling update");
            update(
              (username = data[0]?.username),
              (watchlist = randomWords(5))
            );
          }}
        >
          <Text>Update</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: "#f44",
            borderRadius: 10,
            padding: 10,
            marginHorizontal: 10,
          }}
          onPress={() => {
            console.log("calling drop");
            dropUsers();
          }}
        >
          <Text>Drop</Text>
        </Pressable>
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
});
