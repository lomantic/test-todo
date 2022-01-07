import { StatusBar } from 'expo-status-bar';
import React , {useState, useEffect} from 'react';
import { 
        StyleSheet, 
        Text, 
        View, 
        TouchableOpacity, 
        TextInput, 
        ScrollView, 
        Alert,
        Platform, 
      } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons'; 
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { theme } from './colors';

const STORAGE_KEY = "@toDos";
const STORAGE_TYPE_KEY = "@working";

export default function App() {

  useEffect(() => {
    loadToDos();
  },[])
  const [completed, setCompleted] = useState(false); 
  const [editing, setEditing] = useState(false);
  const [currentKey, setCurrentKey] = useState("");
  const [working, setWorking] = useState(true);
  const [editText, setEditText] = useState("");
  const [text, setText] = useState("");
  const onChangeText = (payload) => setText(payload);
  const onEditChangeText = (payload) => setEditText(payload);
  const [toDos, setToDos] = useState(Object);

  const travel = async() => {
    try{
      setWorking(false);
      await AsyncStorage.setItem(STORAGE_TYPE_KEY, JSON.stringify(false))
    }catch(e){
      //error
      console.log(e);
    }
  };
  const work = async() => {
    try{
      setWorking(true);
      await AsyncStorage.setItem(STORAGE_TYPE_KEY, JSON.stringify(true))
    }catch(e){
      //error
      console.log(e);
    }
  };
  
  const saveToDos= async(toSave) => {
    try{
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    }catch(e){
      //error
      console.log(e);
    }
  };
  const loadToDos = async() => {
    try{
      const state = await AsyncStorage.getItem(STORAGE_TYPE_KEY);
      const toDoInStorage = await AsyncStorage.getItem(STORAGE_KEY);
      if(toDoInStorage){
        setWorking(JSON.parse(state));
        setToDos(JSON.parse(toDoInStorage));
      }

      //console.log("this is Loading");
      //console.log(toDoInStorage);
    }catch(e){
      //error
      console.log(e);
    }
  }
  const addTodo = async() => { 
    if(text === ""){
      return;
    }
    //const newToDos= Object.assign({}, toDos, {[Date.now()]: {text, work: working}});
    const newToDos = {...toDos, [Date.now()]: {text, working, editing, completed} };
    setToDos(newToDos);
    setText("");
    await saveToDos(newToDos);
  };
  const deleteTodo = async(key) => {
    if (Platform.OS === "web"){
      const ok = confirm("Are you sure you want to delete?");
      if (ok) {
        const newToDos = {...toDos};
        delete newToDos[key];
        setToDos(newToDos);
        await saveToDos(newToDos);
      }
    }else{
      Alert.alert(
        "Delete to do", "Are you sure?", [
          {text:"Cancel"},
          {text:"Yes", onPress: async() => {
            const newToDos = {...toDos};
            delete newToDos[key];
            setToDos(newToDos);
            await saveToDos(newToDos);
          }},
      ])
    }
  };

  const editToDo = async(key) => {
    const newToDos = {...toDos};
    setEditing(true);
    newToDos[key].editing = true;
    setToDos(newToDos);
    setCurrentKey(key);
    await saveToDos(newToDos);
  };
  const editSubmitTodo = async() => {
    if(editText === ""){
      Alert.alert("Edit Error", "You must type at least one word");
      return;
    }
    const newToDos = {...toDos};
    newToDos[currentKey].text = editText;
    newToDos[currentKey].editing = false;
    setEditing(false);
    setToDos(newToDos);
    setEditText("");
    await saveToDos(newToDos);
  }
  const cancelEditTodo =async(key) => {
    const newToDos = {...toDos};
    newToDos[currentKey].editing = false;
    setEditing(false);
    setEditText("");
    setToDos(newToDos);
    await saveToDos(newToDos);
  }
  const onCheckBoxClicked = async(key) => {
    const newToDos = {...toDos};
    newToDos[key].completed = !(toDos[key].completed);
    //console.log("This is newTodos");
    //console.log(newToDos);
    setToDos(newToDos);
    //console.log("This is Todos");
    //console.log(toDos);
    await saveToDos(newToDos);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{
            fontSize: 44,
            fontWeight: "600", 
            color: working ? "white" : theme.grey
          }}>
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{    
            fontSize: 44,
            fontWeight: "600", 
            color: !working ? "white" : theme.grey
          }}>
              Travel
          </Text>
        </TouchableOpacity>
      </View>
      
      <TextInput 
        placeholder={working ? "Add to do" : "Where to go"}
        editable = {editing === true ? false : true}
        returnKeyType="send"
        onChangeText={onChangeText}
        onSubmitEditing={addTodo}
        value={text}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) => (
          toDos[key].working === working ? 
          (!toDos[key].editing ? (
            <View style={styles.toDo} key={key}>
              <View style={styles.iconBox}>
                <BouncyCheckbox
                  style={styles.checkbox}
                  //value={completed}
                  isChecked={toDos[key].completed}
                  onPress={() => onCheckBoxClicked(key)}
                  //onValueChange={setCompleted}
                  fillColor={theme.grey}
                  //color={completed ? theme.grey : undefined}
                />{
                  toDos[key].completed === false ?(
                    <Text style={styles.toDoText}>{toDos[key].text}</Text>
                  )
                  :(
                    <Text style={styles.toDoTextCompleted}>{toDos[key].text}</Text>
                  )
                }
                
              </View>
              <View style={styles.iconBox}>
                {
                  toDos[key].completed === false ? (
                  <TouchableOpacity style={styles.icon} onPress ={() => editToDo(key)} disabled={editing === true ? true : false}>
                    <Entypo name="edit" size={18} color={theme.grey} />
                  </TouchableOpacity>)
                  : null
                }
                <TouchableOpacity style={styles.icon} onPress ={() => deleteTodo(key)} disabled={editing === true ? true : false}>
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </TouchableOpacity>
              </View>
            </View>
            )
            : (
              <View style={styles.toDo} key={`${key}_edit`}>
                <TextInput 
                  placeholder={toDos[key].text}
                  returnKeyType="send"
                  onChangeText={onEditChangeText}
                  onSubmitEditing={editSubmitTodo}
                />
                <TouchableOpacity style={styles.icon} onPress ={() => cancelEditTodo(key)}>
                  <MaterialIcons name="cancel" size={18} color={theme.grey} />
                </TouchableOpacity>

              </View>
            )
          )
          : null
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,

  },
  btnText: {
    fontSize: 44,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 15,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 15,
  },
  toDoTextCompleted:{
    color: theme.grey,
    fontSize: 15,
    textDecorationLine: 'line-through', 
    textDecorationStyle: 'solid'
  },
  iconBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon:{
    marginLeft: 8,
    opacity: 1,
  },
  checkbox: {
    marginRight: 8,
  },
});
