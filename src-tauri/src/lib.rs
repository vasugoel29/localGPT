use sysinfo::System;
use std::sync::Mutex;
use tauri::State;
use std::process::Command;

struct SystemState(Mutex<System>);

#[cfg(target_os = "macos")]
fn get_macos_gpu_usage() -> f64 {
    if let Ok(output) = Command::new("ioreg")
        .arg("-l")
        .arg("-w")
        .arg("0")
        .output()
    {
        let stdout = String::from_utf8_lossy(&output.stdout);
        for line in stdout.lines() {
            if line.contains("\"Device Utilization %\"") {
                if let Some(idx) = line.find("\"Device Utilization %\"=") {
                    let num_str = line[idx + 23..].split(',').next().unwrap_or("0");
                    if let Ok(val) = num_str.parse::<f64>() {
                        return val;
                    }
                }
            }
        }
    }
    0.0
}

#[cfg(not(target_os = "macos"))]
fn get_macos_gpu_usage() -> f64 {
    0.0
}

#[tauri::command]
fn get_system_usage(state: State<'_, SystemState>) -> Result<serde_json::Value, String> {
    // Quickly lock and refresh data, storing them off, securely dropping the struct scope mutex 
    let (cpu_usage, total_memory, used_memory) = {
        let mut sys = state.0.lock().map_err(|e| format!("failed to acquire system state lock: {}", e))?;
        sys.refresh_cpu_usage();
        sys.refresh_memory();
        (sys.global_cpu_usage(), sys.total_memory(), sys.used_memory())
    };

    let gpu_usage = get_macos_gpu_usage();

    Ok(serde_json::json!({
        "cpu_usage": cpu_usage,
        "total_memory": total_memory,
        "used_memory": used_memory,
        "gpu_usage": gpu_usage
    }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SystemState(Mutex::new(System::new_all())))
        .invoke_handler(tauri::generate_handler![get_system_usage])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
