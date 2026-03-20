use sysinfo::System;
use std::sync::Mutex;
use tauri::State;

struct SystemState(Mutex<System>);

#[tauri::command]
fn get_system_usage(state: State<'_, SystemState>) -> serde_json::Value {
    let mut sys = state.0.lock().unwrap();
    // Refresh only the specific components we care about for performance
    sys.refresh_cpu_usage();
    sys.refresh_memory();

    // CPU usage is global
    let cpu_usage = sys.global_cpu_usage();
    let total_memory = sys.total_memory();
    let used_memory = sys.used_memory();

    serde_json::json!({
        "cpu_usage": cpu_usage,
        "total_memory": total_memory,
        "used_memory": used_memory
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SystemState(Mutex::new(System::new_all())))
        .invoke_handler(tauri::generate_handler![get_system_usage])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
