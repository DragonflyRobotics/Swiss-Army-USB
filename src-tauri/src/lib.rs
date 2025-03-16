use std::process::Command;

use udev::Enumerator;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn get_usb(name: &str) -> Vec<String> {
    // Create an enumerator to list devices
    let mut enumerator = Enumerator::new().unwrap();

    // Filter for block devices
    enumerator.match_subsystem("block").unwrap();

    let mut devices = vec![];

    for device in enumerator.scan_devices().unwrap() {
        // Check if the device is a whole disk (not a partition)
        if let Some(devtype) = device.property_value("DEVTYPE") {
            if devtype == "disk" {
                // Check if the device is USB
                if let Some(bus) = device.property_value("ID_BUS") {
                    if bus == "usb" {
                        // Print USB device details
                        let devnode = device.devnode().unwrap();
                        let device_name = device.property_value("ID_MODEL").unwrap();
                        let output = Command::new("lsblk")
                            .arg("-b") // Use bytes
                            .arg("-dn") // No headings, no tree view
                            .arg("-o")
                            .arg("SIZE")
                            .arg(devnode.to_str().unwrap())
                            .output()
                            .ok();
                        println!("{:?}", output);
                        let size: usize = String::from_utf8(output.unwrap().stdout).unwrap().trim().parse().unwrap();
                            println!(
                                "Size: {:?}", 
                                size/(1024*1024*1024)
                            );
                        let string = format!("{} - {} - {} GB", device_name.to_str().unwrap(), devnode.to_str().unwrap(), size/(1024*1024*1024));
                        devices.push(string);
                    }
                }
            }
        }
    }
    devices
}

#[tauri::command]
fn multiselect(options: Vec<String>) {
    println!("Selected options: {:?}", options);
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stdout,
                ))
                .build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_usb, multiselect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
