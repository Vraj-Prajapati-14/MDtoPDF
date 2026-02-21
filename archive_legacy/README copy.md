# Linux Command Line Mastery Guide

A comprehensive guide to mastering Linux command line from basics to advanced system administration.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Navigation](#basic-navigation)
3. [File Operations](#file-operations)
4. [Directory Operations](#directory-operations)
5. [Text Processing](#text-processing)
6. [File Permissions](#file-permissions)
7. [User Management](#user-management)
8. [System Administration](#system-administration)
9. [Process Management](#process-management)
10. [Network Commands](#network-commands)
11. [Package Management](#package-management)
12. [Advanced Commands](#advanced-commands)
13. [Shell Scripting Basics](#shell-scripting-basics)

---

## Getting Started

### What is Linux?
Linux is a Unix-like operating system kernel. The command line (terminal/shell) is a text-based interface to interact with the system.

### Opening Terminal
- **Ubuntu/Debian**: `Ctrl + Alt + T` or search "Terminal"
- **CentOS/RHEL**: `Ctrl + Alt + T`
- **macOS**: `Cmd + Space`, type "Terminal"

### Basic Terminal Concepts
- **Prompt**: Shows current user and directory (e.g., `user@hostname:~$`)
- **$**: Regular user prompt
- **#**: Root/Administrator prompt
- **~**: Home directory shortcut
- **/** : Root directory

---

## Basic Navigation

### `pwd` - Print Working Directory
**Usage**: Shows the current directory path
```bash
pwd
# Output: /home/username
```

### `ls` - List Directory Contents
**Usage**: Lists files and directories
```bash
ls                    # List files in current directory
ls -l                 # Long format (detailed)
ls -a                 # Show hidden files (starting with .)
ls -la                # Combine -l and -a
ls -lh                # Human-readable file sizes
ls -R                 # Recursive (show subdirectories)
ls -t                 # Sort by modification time
ls -S                 # Sort by file size
ls /path/to/dir       # List specific directory
```

**Common Options**:
- `-l`: Long format with permissions, owner, size, date
- `-a`: All files including hidden
- `-h`: Human-readable sizes (KB, MB, GB)
- `-R`: Recursive listing
- `-t`: Sort by time
- `-S`: Sort by size
- `-r`: Reverse order

### `cd` - Change Directory
**Usage**: Navigate between directories
```bash
cd                    # Go to home directory
cd ~                  # Go to home directory
cd /                  # Go to root directory
cd ..                 # Go to parent directory
cd ../..              # Go up two levels
cd -                  # Go to previous directory
cd /path/to/dir       # Go to absolute path
cd relative/path      # Go to relative path
cd ~/Documents        # Go to Documents in home
```

### `clear` or `Ctrl+L` - Clear Terminal
**Usage**: Clears the terminal screen
```bash
clear
# Or press Ctrl+L
```

---

## File Operations

### `touch` - Create Empty File
**Usage**: Creates a new empty file or updates timestamp
```bash
touch filename.txt
touch file1.txt file2.txt file3.txt
touch -t 202401011200 filename.txt  # Set specific timestamp
```

### `cat` - Display File Contents
**Usage**: Display entire file content
```bash
cat filename.txt
cat file1.txt file2.txt              # Concatenate multiple files
cat > newfile.txt                    # Create file (type content, Ctrl+D to save)
cat >> existing.txt                  # Append to file
cat file1.txt file2.txt > combined.txt  # Merge files
```

### `less` / `more` - View File Page by Page
**Usage**: View large files page by page
```bash
less filename.txt
more filename.txt

# Navigation in less/more:
# Space: Next page
# b: Previous page
# q: Quit
# /pattern: Search forward
# ?pattern: Search backward
```

### `head` - Display First Lines
**Usage**: Show first N lines of a file
```bash
head filename.txt                    # First 10 lines (default)
head -n 20 filename.txt             # First 20 lines
head -c 100 filename.txt            # First 100 bytes
head -n 5 file1.txt file2.txt       # First 5 lines of multiple files
```

### `tail` - Display Last Lines
**Usage**: Show last N lines of a file
```bash
tail filename.txt                    # Last 10 lines (default)
tail -n 20 filename.txt             # Last 20 lines
tail -f filename.txt                # Follow file (watch for updates) - GREAT for logs
tail -F filename.txt                # Follow with retry (if file rotates)
```

### `cp` - Copy Files/Directories
**Usage**: Copy files and directories
```bash
cp source.txt destination.txt       # Copy file
cp file.txt /path/to/destination/   # Copy to directory
cp -r dir1 dir2                      # Copy directory recursively
cp -v file.txt dest/                 # Verbose (show what's copied)
cp -i file.txt dest/                 # Interactive (prompt before overwrite)
cp -u file.txt dest/                 # Update (only if source is newer)
cp -p file.txt dest/                 # Preserve attributes
cp file*.txt /backup/                # Copy multiple files with wildcard
```

**Common Options**:
- `-r` or `-R`: Recursive (for directories)
- `-v`: Verbose
- `-i`: Interactive
- `-u`: Update
- `-p`: Preserve permissions and timestamps

### `mv` - Move/Rename Files
**Usage**: Move or rename files and directories
```bash
mv oldname.txt newname.txt          # Rename file
mv file.txt /path/to/destination/   # Move file
mv -i file.txt dest/                # Interactive (prompt before overwrite)
mv -v file.txt dest/                # Verbose
mv file1.txt file2.txt dir/         # Move multiple files
mv *.txt /backup/                   # Move all .txt files
```

### `rm` - Remove Files/Directories
**Usage**: Delete files and directories
```bash
rm filename.txt                     # Delete file
rm -r directory/                    # Delete directory recursively
rm -rf directory/                   # Force delete (no prompts)
rm -i file.txt                      # Interactive (prompt before delete)
rm -v file.txt                      # Verbose
rm *.txt                            # Delete all .txt files
rm -rf /path/to/dir                 # Delete directory and contents
```

**⚠️ WARNING**: `rm -rf` is powerful and dangerous! Double-check paths.

### `mkdir` - Create Directory
**Usage**: Create new directories
```bash
mkdir newdir                        # Create single directory
mkdir dir1 dir2 dir3                # Create multiple directories
mkdir -p path/to/nested/dirs        # Create parent directories if needed
mkdir -m 755 mydir                  # Create with specific permissions
```

### `rmdir` - Remove Empty Directory
**Usage**: Remove empty directories only
```bash
rmdir emptydir                      # Remove empty directory
rmdir dir1 dir2 dir3                # Remove multiple empty directories
rmdir -p path/to/nested/dirs        # Remove directory and empty parents
```

### `find` - Search for Files
**Usage**: Find files and directories
```bash
find . -name "*.txt"                # Find .txt files in current directory
find /home -name "file.txt"         # Find file in /home
find . -type f                      # Find only files
find . -type d                      # Find only directories
find . -size +100M                  # Find files larger than 100MB
find . -mtime -7                    # Find files modified in last 7 days
find . -user username               # Find files owned by user
find . -perm 644                    # Find files with specific permissions
find . -name "*.log" -delete        # Find and delete
find . -name "*.txt" -exec ls -l {} \;  # Execute command on found files
```

### `grep` - Search Text in Files
**Usage**: Search for patterns in files
```bash
grep "pattern" file.txt             # Search for pattern in file
grep -i "pattern" file.txt          # Case-insensitive search
grep -r "pattern" /path/            # Recursive search
grep -n "pattern" file.txt          # Show line numbers
grep -v "pattern" file.txt          # Invert match (show non-matching)
grep -c "pattern" file.txt          # Count matches
grep -l "pattern" *.txt             # Show only filenames with matches
grep -E "pattern1|pattern2" file.txt # Extended regex
grep -A 3 "pattern" file.txt        # Show 3 lines after match
grep -B 3 "pattern" file.txt        # Show 3 lines before match
grep -C 3 "pattern" file.txt        # Show 3 lines before and after
```

### `wc` - Word Count
**Usage**: Count lines, words, and characters
```bash
wc file.txt                         # Lines, words, characters
wc -l file.txt                      # Count lines only
wc -w file.txt                      # Count words only
wc -c file.txt                      # Count characters only
wc -m file.txt                      # Count characters (multibyte)
ls | wc -l                          # Count files in directory
```

---

## Directory Operations

### `tree` - Display Directory Tree
**Usage**: Show directory structure as tree
```bash
tree                                # Show tree from current directory
tree -L 2                           # Limit depth to 2 levels
tree -d                             # Show directories only
tree -a                             # Show hidden files
tree -h                             # Show file sizes
```

### `du` - Disk Usage
**Usage**: Show disk space usage
```bash
du                                  # Show directory sizes
du -h                               # Human-readable format
du -sh *                            # Summary of each item in current dir
du -sh /path/to/dir                 # Summary of specific directory
du -a                               # Show files and directories
du --max-depth=1                    # Limit depth
du -h --max-depth=1 /               # Check root directory usage
```

### `df` - Disk Free Space
**Usage**: Show filesystem disk space usage
```bash
df                                  # Show all filesystems
df -h                               # Human-readable format
df -T                               # Show filesystem types
df -i                               # Show inode usage
df -h /                             # Show specific mount point
```

---

## Text Processing

### `echo` - Print Text
**Usage**: Display text or variables
```bash
echo "Hello World"
echo $HOME                          # Print variable
echo -e "Line1\nLine2"              # Enable escape sequences
echo -n "No newline"                # No trailing newline
```

### `printf` - Formatted Print
**Usage**: Formatted output
```bash
printf "Name: %s\nAge: %d\n" "John" 25
printf "%.2f\n" 3.14159             # Format decimal
```

### `sort` - Sort Lines
**Usage**: Sort text lines
```bash
sort file.txt                       # Sort alphabetically
sort -n file.txt                    # Numeric sort
sort -r file.txt                    # Reverse sort
sort -u file.txt                    # Unique (remove duplicates)
sort -k 2 file.txt                  # Sort by second column
sort -t: -k3 file.txt               # Sort by 3rd field (colon separator)
```

### `uniq` - Remove Duplicate Lines
**Usage**: Filter duplicate lines
```bash
uniq file.txt                       # Remove consecutive duplicates
uniq -c file.txt                    # Count occurrences
uniq -d file.txt                    # Show only duplicates
uniq -u file.txt                    # Show only unique lines
sort file.txt | uniq                # Remove all duplicates (must sort first)
```

### `cut` - Extract Columns
**Usage**: Extract fields from lines
```bash
cut -d: -f1 /etc/passwd             # Extract first field (colon delimiter)
cut -d' ' -f1,3 file.txt            # Extract fields 1 and 3 (space delimiter)
cut -c1-10 file.txt                 # Extract characters 1-10
cut -c1,5,10 file.txt               # Extract specific characters
```

### `awk` - Pattern Scanning and Processing
**Usage**: Powerful text processing tool
```bash
awk '{print $1}' file.txt           # Print first column
awk -F: '{print $1}' /etc/passwd    # Set field separator
awk '/pattern/ {print}' file.txt    # Print lines matching pattern
awk '{sum+=$1} END {print sum}' file.txt  # Sum first column
awk 'NR==1,NR==5' file.txt          # Print lines 1-5
awk '{if($1>10) print}' file.txt    # Conditional printing
```

### `sed` - Stream Editor
**Usage**: Text substitution and manipulation
```bash
sed 's/old/new/' file.txt           # Replace first occurrence per line
sed 's/old/new/g' file.txt          # Replace all occurrences
sed 's/old/new/gi' file.txt         # Case-insensitive replace
sed '2d' file.txt                   # Delete line 2
sed '2,5d' file.txt                 # Delete lines 2-5
sed '2a\New line' file.txt          # Append after line 2
sed '2i\New line' file.txt          # Insert before line 2
sed -i 's/old/new/g' file.txt      # Edit file in-place
sed -n '2,5p' file.txt              # Print lines 2-5
```

### `tr` - Translate Characters
**Usage**: Translate or delete characters
```bash
tr 'a-z' 'A-Z' < file.txt           # Convert to uppercase
tr -d '0-9' < file.txt              # Delete digits
tr -s ' ' < file.txt                # Squeeze repeated spaces
tr '\n' ' ' < file.txt              # Replace newlines with spaces
```

### `diff` - Compare Files
**Usage**: Compare two files
```bash
diff file1.txt file2.txt            # Show differences
diff -u file1.txt file2.txt         # Unified format
diff -r dir1/ dir2/                 # Compare directories recursively
diff -q file1.txt file2.txt         # Quiet (only report if different)
```

### `patch` - Apply Diff Files
**Usage**: Apply patch files
```bash
patch file.txt < patch.diff         # Apply patch
patch -p1 < patch.diff              # Apply with strip level
```

---

## File Permissions

### Understanding Permissions
Linux uses a 3-tier permission system:
- **Owner (u)**: File owner
- **Group (g)**: Group members
- **Others (o)**: Everyone else

Each tier has three permissions:
- **Read (r)**: 4
- **Write (w)**: 2
- **Execute (x)**: 1

### `chmod` - Change File Permissions
**Usage**: Modify file/directory permissions
```bash
# Symbolic method
chmod u+x file.txt                  # Add execute for owner
chmod g-w file.txt                  # Remove write for group
chmod o+r file.txt                  # Add read for others
chmod a+x file.txt                  # Add execute for all (a = all)
chmod u=rwx,g=rx,o=r file.txt      # Set specific permissions
chmod +x file.txt                   # Add execute for all

# Numeric method (octal)
chmod 755 file.txt                  # rwxr-xr-x (owner:rwx, group:r-x, others:r-x)
chmod 644 file.txt                  # rw-r--r-- (owner:rw-, group:r--, others:r--)
chmod 600 file.txt                  # rw------- (owner only)
chmod 777 file.txt                  # rwxrwxrwx (all permissions - NOT recommended)
chmod -R 755 directory/             # Recursive (apply to all files/dirs)

# Common permission values:
# 755: Executable files, directories
# 644: Regular files
# 600: Private files
# 700: Private directories
```

### `chown` - Change File Owner
**Usage**: Change file/directory owner and group
```bash
chown user file.txt                 # Change owner
chown user:group file.txt           # Change owner and group
chown -R user:group directory/      # Recursive
sudo chown root:root file.txt       # Change to root (requires sudo)
```

### `chgrp` - Change Group
**Usage**: Change group ownership
```bash
chgrp groupname file.txt            # Change group
chgrp -R groupname directory/       # Recursive
```

### `umask` - Set Default Permissions
**Usage**: Set default permission mask
```bash
umask                               # Show current umask
umask 022                           # Set umask (default: 022)
umask 002                           # Allow group write
```

### `stat` - Display File Status
**Usage**: Show detailed file information
```bash
stat file.txt                       # Show file stats
stat -c "%a %n" *                   # Show permissions and names
stat -f file.txt                    # Show filesystem info
```

---

## User Management

### `whoami` - Current User
**Usage**: Display current username
```bash
whoami
```

### `id` - User ID Information
**Usage**: Show user and group IDs
```bash
id                                  # Current user info
id username                         # Specific user info
id -u                               # User ID only
id -g                               # Group ID only
id -G                               # All group IDs
```

### `who` / `w` - Logged In Users
**Usage**: Show who is logged in
```bash
who                                 # Show logged in users
who -u                              # Show with idle time
w                                   # Show who and what they're doing
```

### `useradd` - Add User
**Usage**: Create new user account
```bash
sudo useradd username               # Create user
sudo useradd -m username            # Create with home directory
sudo useradd -m -s /bin/bash username  # Create with bash shell
sudo useradd -m -G sudo,adm username  # Create with additional groups
sudo useradd -m -c "Full Name" username  # Create with comment
sudo useradd -m -u 1001 username    # Create with specific UID
sudo useradd -m -d /custom/home username  # Custom home directory
```

**Common Options**:
- `-m`: Create home directory
- `-s`: Set shell
- `-G`: Additional groups
- `-c`: Comment (full name)
- `-u`: User ID
- `-d`: Home directory

### `adduser` - Interactive User Creation (Debian/Ubuntu)
**Usage**: Interactive user creation (easier than useradd)
```bash
sudo adduser username                # Interactive user creation
```

### `usermod` - Modify User
**Usage**: Modify existing user account
```bash
sudo usermod -s /bin/bash username  # Change shell
sudo usermod -d /new/home username  # Change home directory
sudo usermod -m -d /new/home username  # Move home directory
sudo usermod -aG sudo username      # Add to sudo group
sudo usermod -aG group1,group2 username  # Add to multiple groups
sudo usermod -L username            # Lock account
sudo usermod -U username            # Unlock account
sudo usermod -c "New Name" username # Change comment
sudo usermod -e 2024-12-31 username # Set account expiration
```

**Common Options**:
- `-s`: Change shell
- `-d`: Change home directory
- `-m`: Move home directory
- `-aG`: Append to groups
- `-L`: Lock account
- `-U`: Unlock account
- `-c`: Change comment
- `-e`: Set expiration date

### `userdel` - Delete User
**Usage**: Remove user account
```bash
sudo userdel username                # Delete user (keep home directory)
sudo userdel -r username             # Delete user and home directory
sudo userdel -f username             # Force delete (even if logged in)
```

**Options**:
- `-r`: Remove home directory
- `-f`: Force removal

### `passwd` - Change Password
**Usage**: Change user password
```bash
passwd                              # Change own password
sudo passwd username                # Change another user's password
sudo passwd -l username             # Lock password
sudo passwd -u username             # Unlock password
sudo passwd -e username             # Force password change on next login
sudo passwd -d username             # Delete password (disable login)
```

### `groupadd` - Create Group
**Usage**: Create new group
```bash
sudo groupadd groupname             # Create group
sudo groupadd -g 1001 groupname    # Create with specific GID
sudo groupadd -r groupname         # Create system group
```

### `groupdel` - Delete Group
**Usage**: Remove group
```bash
sudo groupdel groupname             # Delete group
```

### `groupmod` - Modify Group
**Usage**: Modify group properties
```bash
sudo groupmod -n newname oldname    # Rename group
sudo groupmod -g 1002 groupname    # Change GID
```

### `groups` - Show User Groups
**Usage**: Display user's groups
```bash
groups                              # Current user's groups
groups username                     # Specific user's groups
```

### `newgrp` - Switch Group
**Usage**: Switch to different group
```bash
newgrp groupname                    # Switch to group
```

### `su` - Switch User
**Usage**: Switch to another user
```bash
su                                 # Switch to root (requires root password)
su -                               # Switch to root with login shell
su username                        # Switch to specific user
su - username                      # Switch with login shell
su -c "command" username           # Execute command as another user
```

### `sudo` - Execute as Superuser
**Usage**: Execute commands with elevated privileges
```bash
sudo command                        # Execute command as root
sudo -u username command            # Execute as specific user
sudo -i                             # Interactive root shell
sudo -s                             # Root shell (keep environment)
sudo -l                             # List allowed commands
sudo -v                             # Update timestamp (extend sudo session)
sudo -k                             # Invalidate timestamp (force password)
sudo !!                             # Run previous command with sudo
```

### `visudo` - Edit Sudoers File
**Usage**: Safely edit sudo configuration
```bash
sudo visudo                         # Edit sudoers file
sudo visudo -f /etc/sudoers.d/custom  # Edit custom sudoers file
```

**Sudoers File Syntax**:
```
# Allow user to run all commands
username ALL=(ALL:ALL) ALL

# Allow user to run specific command without password
username ALL=(ALL) NOPASSWD: /usr/bin/apt

# Allow group to run commands
%groupname ALL=(ALL:ALL) ALL

# Allow user to run commands as specific user
username ALL=(www-data) /usr/bin/service nginx *
```

### `/etc/passwd` - User Account Information
**Usage**: View user accounts
```bash
cat /etc/passwd                     # View all users
grep username /etc/passwd           # View specific user
```

**Format**: `username:x:UID:GID:comment:home:shell`

### `/etc/group` - Group Information
**Usage**: View groups
```bash
cat /etc/group                      # View all groups
grep groupname /etc/group           # View specific group
```

**Format**: `groupname:x:GID:members`

### `/etc/shadow` - Password Information
**Usage**: View password hashes (root only)
```bash
sudo cat /etc/shadow                # View password information
```

---

## System Administration

### `uname` - System Information
**Usage**: Display system information
```bash
uname                               # Kernel name
uname -a                            # All information
uname -r                            # Kernel release
uname -m                            # Machine hardware
uname -s                            # Operating system
uname -v                            # Kernel version
```

### `hostname` - Hostname Information
**Usage**: Display or set hostname
```bash
hostname                            # Show hostname
hostname -f                         # Show FQDN (Fully Qualified Domain Name)
hostname -i                         # Show IP address
sudo hostname newname               # Change hostname
```

### `uptime` - System Uptime
**Usage**: Show how long system has been running
```bash
uptime                              # Show uptime and load average
```

### `date` - Date and Time
**Usage**: Display or set date/time
```bash
date                                # Current date and time
date +%Y-%m-%d                      # Format: 2024-01-15
date +%H:%M:%S                      # Format: 14:30:45
date -s "2024-01-15 14:30:00"       # Set date (requires root)
date -d "yesterday"                 # Yesterday's date
date -d "next week"                 # Next week's date
```

### `cal` - Calendar
**Usage**: Display calendar
```bash
cal                                 # Current month
cal 2024                            # Entire year
cal 1 2024                          # Specific month
cal -3                              # Previous, current, next month
```

### `free` - Memory Usage
**Usage**: Display memory usage
```bash
free                                # Memory in KB
free -h                             # Human-readable format
free -m                             # Memory in MB
free -g                             # Memory in GB
free -s 5                           # Update every 5 seconds
```

### `top` - Process Monitor
**Usage**: Real-time process monitor
```bash
top                                 # Show running processes
# Press 'q' to quit
# Press 'k' to kill process
# Press 'M' to sort by memory
# Press 'P' to sort by CPU
```

### `htop` - Enhanced Process Monitor
**Usage**: Better process monitor (if installed)
```bash
htop                                # Enhanced top (install: sudo apt install htop)
```

### `ps` - Process Status
**Usage**: Show running processes
```bash
ps                                  # Current user's processes
ps aux                              # All processes (detailed)
ps -ef                              # All processes (standard format)
ps aux | grep nginx                 # Find specific process
ps -u username                      # User's processes
ps -p PID                           # Specific process
ps --forest                         # Show process tree
```

### `kill` - Terminate Process
**Usage**: Send signal to process
```bash
kill PID                            # Terminate process (SIGTERM)
kill -9 PID                         # Force kill (SIGKILL)
kill -15 PID                        # Graceful termination
kill -HUP PID                       # Hangup signal (reload)
killall processname                 # Kill all processes by name
killall -9 processname              # Force kill all
pkill processname                   # Kill by pattern
```

**Common Signals**:
- `1` (SIGHUP): Hangup
- `2` (SIGINT): Interrupt (Ctrl+C)
- `9` (SIGKILL): Force kill
- `15` (SIGTERM): Terminate (default)

### `jobs` - Background Jobs
**Usage**: Show background jobs
```bash
jobs                                # List jobs
jobs -l                             # List with PIDs
fg %1                               # Bring job 1 to foreground
bg %1                               # Send job 1 to background
```

### `nohup` - Run Command Immune to Hangups
**Usage**: Run command that continues after logout
```bash
nohup command &                     # Run in background, immune to hangups
nohup command > output.log 2>&1 &   # Redirect output
```

### `systemctl` - Systemd Service Management
**Usage**: Manage system services
```bash
sudo systemctl start servicename    # Start service
sudo systemctl stop servicename     # Stop service
sudo systemctl restart servicename  # Restart service
sudo systemctl reload servicename   # Reload configuration
sudo systemctl status servicename   # Check status
sudo systemctl enable servicename   # Enable on boot
sudo systemctl disable servicename  # Disable on boot
sudo systemctl list-units           # List all units
sudo systemctl list-unit-files     # List unit files
sudo systemctl daemon-reload        # Reload systemd configuration
```

### `service` - Service Management (Legacy)
**Usage**: Manage services (older systems)
```bash
sudo service servicename start       # Start service
sudo service servicename stop       # Stop service
sudo service servicename restart    # Restart service
sudo service servicename status     # Check status
```

### `journalctl` - System Logs
**Usage**: View systemd journal logs
```bash
journalctl                           # All logs
journalctl -u servicename           # Service logs
journalctl -f                       # Follow logs (like tail -f)
journalctl -n 100                    # Last 100 entries
journalctl --since "1 hour ago"     # Since time
journalctl --since today            # Since today
journalctl -p err                   # Error level and above
journalctl -x                       # Include explanations
```

### `dmesg` - Kernel Messages
**Usage**: Display kernel ring buffer
```bash
dmesg                               # All kernel messages
dmesg | tail                        # Last messages
dmesg | grep error                  # Error messages
dmesg -w                            # Watch for new messages
sudo dmesg -C                       # Clear messages
```

### `log` Files Location
**Common log file locations**:
```bash
/var/log/syslog                     # System log
/var/log/auth.log                   # Authentication log
/var/log/kern.log                   # Kernel log
/var/log/apache2/                   # Apache logs
/var/log/nginx/                     # Nginx logs
/var/log/mysql/                     # MySQL logs
```

### `cron` - Scheduled Tasks
**Usage**: Schedule recurring tasks
```bash
crontab -e                          # Edit crontab
crontab -l                          # List crontab
crontab -r                          # Remove crontab
crontab -u username -e              # Edit user's crontab (root)
```

**Crontab Format**: `minute hour day month weekday command`
```
# Examples:
0 2 * * * /path/to/backup.sh       # Daily at 2 AM
*/5 * * * * /path/to/script.sh     # Every 5 minutes
0 0 1 * * /path/to/script.sh       # First day of month
0 9-17 * * 1-5 /path/to/script.sh  # 9 AM to 5 PM, Mon-Fri
```

### `at` - One-time Scheduled Task
**Usage**: Schedule one-time task
```bash
at 14:30                            # Schedule at 2:30 PM
at now + 1 hour                     # Schedule in 1 hour
at 2024-12-25                       # Schedule on date
atq                                 # List scheduled jobs
atrm jobnumber                      # Remove job
```

### `shutdown` - Shutdown System
**Usage**: Shutdown or reboot system
```bash
sudo shutdown                       # Shutdown in 1 minute
sudo shutdown now                   # Shutdown immediately
sudo shutdown +5                    # Shutdown in 5 minutes
sudo shutdown -r now                # Reboot now
sudo shutdown -h now                # Halt now
sudo shutdown -c                    # Cancel scheduled shutdown
```

### `reboot` - Reboot System
**Usage**: Reboot the system
```bash
sudo reboot                         # Reboot now
sudo reboot -f                      # Force reboot
```

### `poweroff` - Power Off
**Usage**: Power off the system
```bash
sudo poweroff                       # Power off
```

---

## Process Management

### `nice` - Set Process Priority
**Usage**: Run process with modified priority
```bash
nice -n 10 command                  # Run with nice value 10 (lower priority)
nice -n -10 command                 # Run with nice value -10 (higher priority, requires root)
```

### `renice` - Change Process Priority
**Usage**: Change priority of running process
```bash
renice 10 PID                       # Change nice value to 10
renice -10 PID                      # Higher priority (requires root)
renice -n 5 -p PID                  # Change to nice value 5
renice -n 5 -u username             # Change all processes of user
```

### `pgrep` - Find Process by Name
**Usage**: Find process IDs by name
```bash
pgrep nginx                         # Find nginx PIDs
pgrep -u username                   # Find user's processes
pgrep -f "pattern"                  # Find by full command
pgrep -l nginx                      # Show process names
```

### `pstree` - Process Tree
**Usage**: Show process tree
```bash
pstree                              # Show process tree
pstree -p                           # Show with PIDs
pstree -u                           # Show with usernames
pstree username                     # Show user's processes
```

### `lsof` - List Open Files
**Usage**: List open files and processes
```bash
lsof                                # All open files
lsof -u username                    # User's open files
lsof -p PID                         # Process's open files
lsof -i :80                         # Files using port 80
lsof -i tcp                         # TCP connections
lsof /path/to/file                  # Processes using file
```

### `fuser` - Identify Processes Using Files
**Usage**: Find processes using files/directories
```bash
fuser /path/to/file                 # Show PIDs using file
fuser -k /path/to/file              # Kill processes using file
fuser -v /path/to/file              # Verbose output
```

---

## Network Commands

### `ping` - Test Network Connectivity
**Usage**: Test connection to host
```bash
ping google.com                     # Ping continuously
ping -c 4 google.com                # Ping 4 times
ping -i 2 google.com                # Ping every 2 seconds
ping -s 1000 google.com             # Ping with 1000 byte packets
```

### `ifconfig` - Network Interface Configuration
**Usage**: Configure network interfaces
```bash
ifconfig                            # Show all interfaces
ifconfig eth0                       # Show specific interface
sudo ifconfig eth0 up               # Bring interface up
sudo ifconfig eth0 down             # Bring interface down
sudo ifconfig eth0 192.168.1.100    # Set IP address
```

### `ip` - Modern Network Configuration
**Usage**: Modern network configuration tool
```bash
ip addr                             # Show IP addresses (ip a)
ip link                             # Show network interfaces
ip route                            # Show routing table
ip route add default via 192.168.1.1  # Add default route
ip -s link                          # Show interface statistics
```

### `netstat` - Network Statistics
**Usage**: Display network connections
```bash
netstat -a                          # All connections
netstat -t                          # TCP connections
netstat -u                          # UDP connections
netstat -l                          # Listening ports
netstat -p                          # Show PIDs
netstat -n                          # Numeric addresses
netstat -i                          # Network interfaces
netstat -r                          # Routing table
```

### `ss` - Socket Statistics
**Usage**: Modern replacement for netstat
```bash
ss                                  # All sockets
ss -t                               # TCP sockets
ss -u                               # UDP sockets
ss -l                               # Listening sockets
ss -p                               # Show processes
ss -n                               # Numeric addresses
ss -a                               # All sockets
```

### `wget` - Download Files
**Usage**: Download files from web
```bash
wget http://example.com/file.zip    # Download file
wget -O output.zip URL              # Save with different name
wget -c URL                         # Continue interrupted download
wget -r URL                         # Recursive download
wget -P /path/to/dir URL            # Download to directory
wget --limit-rate=200k URL          # Limit download speed
```

### `curl` - Transfer Data
**Usage**: Transfer data to/from server
```bash
curl http://example.com             # Download URL
curl -O http://example.com/file.zip # Save file
curl -o output.zip URL              # Save with name
curl -L URL                         # Follow redirects
curl -I URL                         # Headers only
curl -X POST -d "data" URL          # POST request
curl -H "Header: value" URL         # Custom header
curl -u user:pass URL               # Authentication
```

### `ssh` - Secure Shell
**Usage**: Remote login
```bash
ssh user@hostname                   # Connect to remote host
ssh -p 2222 user@hostname          # Connect on specific port
ssh -i ~/.ssh/key.pem user@host    # Use specific key
ssh -X user@hostname               # Enable X11 forwarding
ssh -L 8080:localhost:80 user@host # Local port forwarding
```

### `scp` - Secure Copy
**Usage**: Copy files over SSH
```bash
scp file.txt user@host:/path/      # Copy to remote
scp user@host:/path/file.txt .     # Copy from remote
scp -r dir/ user@host:/path/       # Copy directory
scp -P 2222 file.txt user@host:/   # Specific port
scp -i key.pem file.txt user@host:/ # Use key file
```

### `rsync` - Remote Sync
**Usage**: Synchronize files
```bash
rsync -av source/ dest/            # Sync directories
rsync -avz source/ user@host:/dest/ # Sync over SSH (compressed)
rsync -av --delete source/ dest/   # Delete files not in source
rsync -av --exclude='*.log' source/ dest/  # Exclude patterns
rsync -av --progress source/ dest/  # Show progress
```

### `hostname` - DNS Lookup
**Usage**: DNS queries
```bash
hostname google.com                 # Lookup hostname
hostname -a google.com              # All addresses
hostname -t google.com              # Type only
```

### `nslookup` - Name Server Lookup
**Usage**: Query DNS
```bash
nslookup google.com                 # Lookup domain
nslookup -type=MX google.com       # Lookup MX records
nslookup -type=NS google.com        # Lookup NS records
```

### `dig` - DNS Lookup Tool
**Usage**: DNS information groper
```bash
dig google.com                      # Lookup domain
dig @8.8.8.8 google.com            # Use specific DNS server
dig google.com MX                   # Lookup MX records
dig google.com +short               # Short output
dig -x 8.8.8.8                     # Reverse lookup
```

### `traceroute` - Trace Route
**Usage**: Trace path to host
```bash
traceroute google.com               # Trace route
traceroute -n google.com           # Numeric addresses
traceroute -m 30 google.com        # Max hops
```

### `tcpdump` - Packet Analyzer
**Usage**: Capture network packets
```bash
sudo tcpdump                        # Capture all packets
sudo tcpdump -i eth0                # Specific interface
sudo tcpdump port 80                # Specific port
sudo tcpdump host 192.168.1.1      # Specific host
sudo tcpdump -w file.pcap          # Save to file
sudo tcpdump -r file.pcap          # Read from file
```

### `iptables` - Firewall Rules
**Usage**: Configure firewall (requires root)
```bash
sudo iptables -L                    # List rules
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT  # Allow port 80
sudo iptables -A INPUT -s 192.168.1.0/24 -j ACCEPT  # Allow subnet
sudo iptables -D INPUT 1            # Delete rule
sudo iptables -F                    # Flush all rules
sudo iptables -S                    # Show rules in command format
```

---

## Package Management

### APT (Debian/Ubuntu)
**Usage**: Advanced Package Tool
```bash
sudo apt update                     # Update package list
sudo apt upgrade                    # Upgrade packages
sudo apt install package            # Install package
sudo apt remove package             # Remove package
sudo apt purge package              # Remove package and config
sudo apt search keyword             # Search packages
sudo apt show package               # Show package info
sudo apt list --installed           # List installed packages
sudo apt list --upgradable          # List upgradable packages
sudo apt autoremove                 # Remove unused packages
sudo apt clean                      # Clean package cache
sudo apt autoclean                  # Clean old package files
```

### YUM (CentOS/RHEL 7)
**Usage**: Yellowdog Updater Modified
```bash
sudo yum update                     # Update packages
sudo yum install package            # Install package
sudo yum remove package             # Remove package
sudo yum search keyword             # Search packages
sudo yum info package               # Show package info
sudo yum list installed             # List installed
sudo yum list available             # List available
sudo yum clean all                  # Clean cache
```

### DNF (CentOS/RHEL 8+, Fedora)
**Usage**: Dandified YUM
```bash
sudo dnf update                     # Update packages
sudo dnf install package            # Install package
sudo dnf remove package             # Remove package
sudo dnf search keyword             # Search packages
sudo dnf info package               # Show package info
sudo dnf list installed             # List installed
sudo dnf clean all                  # Clean cache
```

### Snap
**Usage**: Snap package manager
```bash
sudo snap install package           # Install snap
sudo snap remove package            # Remove snap
sudo snap list                      # List installed snaps
sudo snap refresh                   # Update snaps
sudo snap refresh package           # Update specific snap
```

---

## Advanced Commands

### `tar` - Archive Files
**Usage**: Create and extract archives
```bash
# Create archive
tar -cf archive.tar files/         # Create tar
tar -czf archive.tar.gz files/     # Create gzip compressed
tar -cjf archive.tar.bz2 files/    # Create bzip2 compressed
tar -cJf archive.tar.xz files/     # Create xz compressed

# Extract archive
tar -xf archive.tar                # Extract tar
tar -xzf archive.tar.gz            # Extract gzip
tar -xjf archive.tar.bz2           # Extract bzip2
tar -xJf archive.tar.xz            # Extract xz

# List contents
tar -tf archive.tar                # List contents
tar -tzf archive.tar.gz            # List gzip archive

# Options:
# -c: Create
# -x: Extract
# -f: File
# -z: gzip
# -j: bzip2
# -J: xz
# -v: Verbose
# -t: List
```

### `zip` / `unzip` - ZIP Archives
**Usage**: Create and extract ZIP files
```bash
zip archive.zip file1 file2        # Create ZIP
zip -r archive.zip directory/      # Recursive
unzip archive.zip                  # Extract
unzip -l archive.zip               # List contents
unzip -d /path archive.zip         # Extract to directory
```

### `gzip` / `gunzip` - Compress Files
**Usage**: Compress/decompress files
```bash
gzip file.txt                      # Compress (creates file.txt.gz)
gunzip file.txt.gz                 # Decompress
gzip -d file.txt.gz                # Decompress
gzip -k file.txt                   # Keep original
```

### `bzip2` / `bunzip2` - Bzip2 Compression
**Usage**: Compress/decompress with bzip2
```bash
bzip2 file.txt                     # Compress
bunzip2 file.txt.bz2               # Decompress
bzip2 -d file.txt.bz2              # Decompress
bzip2 -k file.txt                  # Keep original
```

### `mount` - Mount Filesystems
**Usage**: Mount filesystems
```bash
mount                               # Show mounted filesystems
sudo mount /dev/sdb1 /mnt          # Mount device
sudo mount -t ext4 /dev/sdb1 /mnt  # Mount with type
sudo mount -o ro /dev/sdb1 /mnt    # Mount read-only
sudo umount /mnt                    # Unmount
sudo umount -l /mnt                 # Lazy unmount
```

### `fdisk` - Disk Partitioning
**Usage**: Partition disk (requires root)
```bash
sudo fdisk -l                      # List partitions
sudo fdisk /dev/sdb                # Partition disk (interactive)
```

### `lsblk` - List Block Devices
**Usage**: List block devices
```bash
lsblk                              # List all block devices
lsblk -f                           # Show filesystems
lsblk -o NAME,SIZE,TYPE            # Custom output
```

### `dd` - Disk Dump
**Usage**: Copy and convert data
```bash
dd if=/dev/sda of=/dev/sdb bs=4M   # Clone disk
dd if=/dev/zero of=file.img bs=1M count=100  # Create 100MB file
dd if=/dev/urandom of=file.bin bs=1M count=10  # Random data
dd if=file.iso of=/dev/sdb         # Write ISO to USB
```

**⚠️ WARNING**: `dd` is powerful and can destroy data. Use with extreme caution!

### `history` - Command History
**Usage**: View command history
```bash
history                             # Show history
history | grep command              # Search history
history -c                          # Clear history
!n                                  # Execute history line n
!!                                  # Execute last command
!string                             # Execute last command starting with string
```

### `alias` - Create Aliases
**Usage**: Create command shortcuts
```bash
alias ll='ls -alF'                  # Create alias
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
unalias ll                          # Remove alias
alias                                # List all aliases
```

**To make permanent**, add to `~/.bashrc` or `~/.bash_aliases`

### `export` - Environment Variables
**Usage**: Set environment variables
```bash
export VAR=value                    # Set variable
export PATH=$PATH:/new/path        # Add to PATH
env                                 # Show all environment variables
echo $VAR                           # Print variable
unset VAR                           # Unset variable
```

### `source` / `.` - Execute Script
**Usage**: Execute script in current shell
```bash
source script.sh                    # Execute script
. script.sh                        # Same as source
source ~/.bashrc                    # Reload bashrc
```

### `which` - Locate Command
**Usage**: Find command location
```bash
which command                       # Show command path
which -a command                    # Show all instances
```

### `whereis` - Locate Binary/Source/Manual
**Usage**: Locate binary, source, and manual pages
```bash
whereis command                     # Find command files
whereis -b command                  # Binary only
whereis -m command                  # Manual only
```

### `locate` - Find Files by Name
**Usage**: Quick file search (requires updatedb)
```bash
locate filename                     # Find file
locate -i filename                  # Case-insensitive
locate -c filename                  # Count matches
sudo updatedb                       # Update database
```

### `xargs` - Execute Commands
**Usage**: Build and execute commands from input
```bash
find . -name "*.txt" | xargs rm    # Delete found files
find . -name "*.txt" | xargs cat   # Cat all found files
echo "1 2 3" | xargs -n1 echo      # Process one at a time
find . -name "*.txt" -print0 | xargs -0 rm  # Handle spaces
```

### `tee` - Redirect to File and Screen
**Usage**: Write to file and stdout
```bash
command | tee file.txt              # Write to file and screen
command | tee -a file.txt           # Append to file
command | tee file1.txt file2.txt   # Write to multiple files
```

### `watch` - Execute Periodically
**Usage**: Execute command repeatedly
```bash
watch -n 1 'ps aux | grep nginx'   # Update every 1 second
watch -d 'ls -l'                    # Highlight differences
watch -n 5 date                     # Update every 5 seconds
```

### `time` - Measure Execution Time
**Usage**: Measure command execution time
```bash
time command                        # Measure execution time
/usr/bin/time -v command            # Detailed statistics
```

### `strace` - Trace System Calls
**Usage**: Trace system calls and signals
```bash
strace command                      # Trace command
strace -p PID                       # Trace running process
strace -e trace=open,read command   # Trace specific calls
strace -c command                   # Summary statistics
```

### `tcpdump` - Network Packet Analyzer
**Usage**: Capture and analyze network packets
```bash
sudo tcpdump                        # Capture all packets
sudo tcpdump -i eth0                # Specific interface
sudo tcpdump port 80                # Specific port
sudo tcpdump host 192.168.1.1      # Specific host
sudo tcpdump -w file.pcap          # Save to file
sudo tcpdump -r file.pcap          # Read from file
```

### `screen` - Terminal Multiplexer
**Usage**: Multiple terminal sessions
```bash
screen                              # Start screen
screen -S sessionname              # Named session
screen -r                           # Reattach session
screen -r sessionname              # Reattach named session
screen -ls                          # List sessions
# Inside screen: Ctrl+A then D to detach
```

### `tmux` - Terminal Multiplexer
**Usage**: Advanced terminal multiplexer
```bash
tmux                                # Start tmux
tmux new -s sessionname            # Named session
tmux attach -t sessionname         # Attach session
tmux ls                             # List sessions
tmux kill-session -t sessionname   # Kill session
# Inside tmux: Ctrl+B then D to detach
```

---

## Shell Scripting Basics

### Shebang
```bash
#!/bin/bash                         # Bash script
#!/bin/sh                           # POSIX shell
```

### Variables
```bash
VAR="value"                         # Set variable
echo $VAR                           # Use variable
echo ${VAR}                         # Explicit syntax
echo "${VAR}_suffix"                # With suffix
```

### Command Substitution
```bash
DATE=$(date)                        # Command substitution
DATE=`date`                         # Old syntax
FILES=$(ls)                         # Store command output
```

### Conditional Statements
```bash
if [ condition ]; then
    commands
fi

if [ $VAR -eq 10 ]; then
    echo "Equal"
elif [ $VAR -gt 10 ]; then
    echo "Greater"
else
    echo "Less"
fi
```

### Loops
```bash
# For loop
for i in 1 2 3; do
    echo $i
done

for file in *.txt; do
    echo $file
done

# While loop
while [ condition ]; do
    commands
done

# Until loop
until [ condition ]; do
    commands
done
```

### Functions
```bash
function_name() {
    commands
    return value
}

# Call function
function_name
```

### Test Operators
```bash
[ -f file ]                         # File exists
[ -d dir ]                          # Directory exists
[ -r file ]                         # Readable
[ -w file ]                         # Writable
[ -x file ]                         # Executable
[ -z string ]                       # String is empty
[ -n string ]                       # String is not empty
[ str1 = str2 ]                     # Strings equal
[ str1 != str2 ]                    # Strings not equal
[ num1 -eq num2 ]                   # Numbers equal
[ num1 -ne num2 ]                   # Numbers not equal
[ num1 -lt num2 ]                   # Less than
[ num1 -le num2 ]                   # Less or equal
[ num1 -gt num2 ]                   # Greater than
[ num1 -ge num2 ]                   # Greater or equal
```

---

## Quick Reference

### File Permissions
- `755`: `rwxr-xr-x` (directories, executables)
- `644`: `rw-r--r--` (regular files)
- `600`: `rw-------` (private files)
- `700`: `rwx------` (private directories)

### Common Directories
- `/`: Root directory
- `/home`: User home directories
- `/etc`: Configuration files
- `/var`: Variable data (logs, etc.)
- `/usr`: User programs
- `/bin`: Essential binaries
- `/sbin`: System binaries
- `/tmp`: Temporary files
- `/opt`: Optional software
- `/root`: Root user home

### Important Files
- `~/.bashrc`: Bash configuration
- `~/.bash_profile`: Bash profile
- `~/.bash_history`: Command history
- `/etc/passwd`: User accounts
- `/etc/group`: Groups
- `/etc/shadow`: Password hashes
- `/etc/sudoers`: Sudo configuration
- `/etc/fstab`: Filesystem table
- `/etc/hosts`: Hostname mappings

### Keyboard Shortcuts
- `Ctrl+C`: Interrupt/Stop
- `Ctrl+D`: Exit/EOF
- `Ctrl+Z`: Suspend
- `Ctrl+L`: Clear screen
- `Ctrl+A`: Beginning of line
- `Ctrl+E`: End of line
- `Ctrl+U`: Delete to beginning
- `Ctrl+K`: Delete to end
- `Ctrl+W`: Delete word
- `Ctrl+R`: Search history
- `Tab`: Auto-complete
- `Tab Tab`: Show completions

---

## Practice Exercises

1. **Basic Navigation**
   - Navigate to your home directory
   - List all files including hidden ones
   - Create a test directory and navigate into it

2. **File Operations**
   - Create multiple text files
   - Copy files to a backup directory
   - Find and delete files older than 7 days

3. **Text Processing**
   - Search for a pattern in multiple files
   - Count lines in all `.txt` files
   - Sort and remove duplicates from a file

4. **Permissions**
   - Create a script and make it executable
   - Change file ownership
   - Set directory permissions to 755

5. **User Management**
   - Create a new user with home directory
   - Add user to sudo group
   - Change user password

6. **System Administration**
   - Check system uptime and load
   - List all running processes
   - Check disk usage

7. **Networking**
   - Check network interfaces
   - Test connectivity to a website
   - List listening ports

8. **Shell Scripting**
   - Create a backup script
   - Write a script that processes log files
   - Create a user management script

---

## Tips for Learning

1. **Practice Daily**: Use the terminal for everyday tasks
2. **Read Man Pages**: `man command` for detailed help
3. **Use Tab Completion**: Saves time and prevents errors
4. **Learn Regular Expressions**: Essential for text processing
5. **Understand Permissions**: Critical for security
6. **Master One Editor**: vim or nano
7. **Read Logs**: Learn to troubleshoot
8. **Write Scripts**: Automate repetitive tasks
9. **Join Communities**: Linux forums and communities
10. **Build Projects**: Apply knowledge in real scenarios

---

## Additional Resources

- **Man Pages**: `man command`
- **Info Pages**: `info command`
- **Help**: `command --help` or `command -h`
- **Online**: Linux documentation, Stack Overflow, Arch Wiki

---

## Safety Reminders

⚠️ **Always be careful with**:
- `rm -rf` - Can delete everything
- `dd` - Can overwrite disks
- `chmod 777` - Too permissive
- `sudo` - Double-check commands
- Modifying system files without backup

**Best Practices**:
- Always backup before major changes
- Test commands in safe environment first
- Use `-i` flag for interactive prompts
- Read man pages for dangerous commands
- Keep system updated

---

**Happy Learning! 🐧**

*This guide covers Linux command line from basics to advanced topics. Practice regularly and refer to man pages for detailed information.*

