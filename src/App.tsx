import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import Multiselect from 'multiselect-react-dropdown';
import Select from 'react-select';
import chroma from 'chroma-js';
import "./App.css";

function App() {
    const [devices, setDevices] = useState([]);
    const [name, setName] = useState("");
    const [optionsList, setOptionsList] = useState([]);


    async function get_usb() {
        // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
        let devices = await invoke("get_usb", { name });
        let deviceOptions = [];
        for (let i = 0; i < devices.length; i++) {
            deviceOptions.push({ label: devices[i], value: i });
        }
        setDevices(deviceOptions);
        setName("");
    }

    async function onSelect(selectedList, selectedItem) {
        let list = selectedList.map((item) => item.name);
        setOptionsList(list);
        console.log(optionsList);
    }


    const state = {
        options: [{label: 'Ventoy', value: 1},{label: 'Storage', value: 2}, {label: "Encrypted Vault", value: 3}, {label: "Persistent Vol OS", value: 4}],
    };

    useEffect(() => {
        get_usb();
    }, []);


    return (
        <main className="container">
            <h1>Swiss Army USB Flasher</h1>

            <form
                className="col"
                onSubmit={(e) => {
                    e.preventDefault();
                    get_usb();
                }}
            >
                <p>Available USB Devices</p>
                <div className="row">
                    <Select
                        options={devices}
                        value="hehe"
                        onChange={(e) => setName(e.label)}

                        styles={{ //change font color to black
                        option: (styles) => {
                            return {
                                ...styles,
                                color: 'black',
                            };
                        },
                    }}

                    />
                    <button onClick={get_usb}>Refresh</button>

                </div>

                <p>Select Primary Features</p>
                <Select
                    isMulti
                    options={state.options}
                    onChange={onSelect}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    styles={{ //change font color to black
                        option: (styles) => {
                            return {
                                ...styles,
                                color: 'black',
                            };
                        },
                    }}
                />

                {optionsList.find((element) => element === "Encrypted Vault") && (
                    <div>
                        <input type="text" placeholder="Enter Password" />
                    </div>
                )}
                <button type="submit">Flash</button>
            </form>
            <p>{optionsList}</p>
            {/* Conditionally render the element */}
            {optionsList.length > 0 && (
                <div className="selected-options">
                    <h2>Selected Features:</h2>
                    <ul>
                        {optionsList.map((option) => (
                            <li>{option}hi</li>
                        ))}
                    </ul>
                </div>
            )}
            <p>{name}</p>
        </main>
    );
}

export default App;
