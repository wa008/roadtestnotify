import os

def main():
    # if OS is macos, file is "../notification/notification_log.txt"
    # "2025-11-09 18:00:05	2025-11-19	2025-11-09 16:21:43	G2	Ottawa Walkley"
    if os.name == "posix" and os.uname().sysname == "Darwin":
        file = "/Users/wa007/code/drive-test-assistant/notification/notification_log.txt"
    else:
        file = "/home/azureuser/service/drive-test-assistant/notification/notification_log.txt"
    print (f"file: {file}")
    datas = open(file, "r").readlines()
    hour_counts = {}
    for i in range(24):
        hour_string = f"{i:02}"
        hour_counts[hour_string] = 0
    for data in datas:
        parts = data.split("\t")
        generate_time = parts[2]
        test_type = parts[3]
        generate_hour = generate_time.split(" ")[1].split(":")[0]
        hour_counts[generate_hour] += 1
        
    output_file = "./statistics_logs_by_hour.txt"
    for i in range(24):
        hour_string = f"{i:02}"
        print(f"{hour_string}\t{hour_counts[hour_string]}")

    with open(output_file, "w") as f:
        for i in range(24):
            hour_string = f"{i:02}"
            f.write(f"{hour_string}\t{hour_counts[hour_string]}\n")

if __name__ == "__main__":
    main()