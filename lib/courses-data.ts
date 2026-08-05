export interface HardcodedCourse {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  _count: { lessons: number; enrollments: number };
  lessons: HardcodedLesson[];
}

export interface HardcodedLesson {
  lessonId: string;
  title: string;
  type: "PDF" | "QUIZ";
  order: number;
  unlocked: boolean;
  completed: boolean;
  watchPct: number;
  /** Markdown content for PDF lessons */
  content?: string;
  /** Questions for QUIZ lessons */
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const hardcodedCourses: HardcodedCourse[] = [
  // ─── Course 1 ──────────────────────────────────────────────────────────
  {
    id: "course-intro-cybersec",
    title: "Introduction to Cybersecurity",
    description:
      "Learn the fundamentals of cybersecurity — from threat landscapes to defense strategies. Perfect for beginners looking to break into the field.",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    _count: { lessons: 5, enrollments: 0 },
    lessons: [
      {
        lessonId: "intro-les-1",
        title: "What is Cybersecurity?",
        type: "PDF",
        order: 1,
        unlocked: true,
        completed: false,
        watchPct: 0,
        content: `## What is Cybersecurity?

Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These attacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes.

### Why Cybersecurity Matters

In today's hyper-connected world, nearly every organization depends on digital infrastructure. A single breach can cost millions of dollars, damage reputation, and expose sensitive customer data. The average cost of a data breach in 2024 reached **$4.88 million** globally.

### The Threat Landscape

Modern cyber threats include:

- **Malware** — Viruses, worms, trojans, and ransomware that infiltrate systems
- **Phishing** — Deceptive emails or messages tricking users into revealing credentials
- **Man-in-the-Middle (MitM)** — Attackers intercept communications between two parties
- **Denial-of-Service (DoS)** — Overwhelming systems to make them unavailable
- **SQL Injection** — Inserting malicious code into database queries through web forms
- **Zero-Day Exploits** — Attacks targeting unknown vulnerabilities before patches exist

### Key Terminology

| Term | Definition |
|------|-----------|
| **CIA Triad** | Confidentiality, Integrity, Availability — the three pillars of information security |
| **Attack Surface** | The sum of all points where an unauthorized user can enter or extract data |
| **Threat Actor** | Any person or entity that poses a security risk (hacktivist, nation-state, insider) |
| **Vulnerability** | A weakness in a system that can be exploited by a threat actor |
| **Patch** | A software update that fixes security vulnerabilities |

### Defense in Depth

The principle of **defense in depth** means applying multiple layers of security controls. If one layer fails, another is in place. Typical layers include:

1. **Perimeter** — Firewalls, DMZs, network segmentation
2. **Network** — IDS/IPS, VPNs, encryption in transit
3. **Host** — Antivirus, endpoint detection, host-based firewalls
4. **Application** — Input validation, secure coding, WAFs
5. **Data** — Encryption at rest, access controls, backups

### Summary

Cybersecurity is not just an IT concern — it's a business imperative. Understanding the threat landscape and core principles is the first step toward building a secure digital environment.`,
      },
      {
        lessonId: "intro-les-2",
        title: "Common Threats and Attack Vectors",
        type: "PDF",
        order: 2,
        unlocked: false,
        completed: false,
        watchPct: 0,
        content: `## Common Threats and Attack Vectors

Understanding how attackers operate is essential for building effective defenses. This lesson covers the most prevalent threat types and the vectors through which they reach their targets.

### Social Engineering Attacks

Social engineering exploits human psychology rather than technical vulnerabilities:

- **Phishing** — Bulk fraudulent emails impersonating trusted entities (banks, tech companies) to harvest credentials or deliver malware
- **Spear Phishing** — Targeted phishing aimed at specific individuals, often using personal information gathered from social media
- **Whaling** — Spear phishing targeting C-suite executives or high-value targets
- **Pretexting** — Creating a fabricated scenario (e.g., IT support call) to manipulate victims into divulging information
- **Baiting** — Leaving infected USB drives in public places, hoping someone plugs them in

### Malware Categories

| Type | Description | Example |
|------|-------------|---------|
| **Virus** | Attaches to legitimate files, spreads when executed | ILOVEYOU worm |
| **Ransomware** | Encrypts files and demands payment for decryption | WannaCry, LockBit |
| **Spyware** | Covertly monitors user activity and collects data | Pegasus, Keyloggers |
| **Trojan** | Disguised as legitimate software but performs malicious actions | Emotet |
| **Worm** | Self-propagating across networks without user interaction | Conficker |

### Network-Based Attacks

- **DDoS (Distributed Denial-of-Service)** — Botnets flood target servers with traffic from thousands of sources
- **DNS Spoofing** — Corrupting DNS cache to redirect users to malicious websites
- **ARP Spoofing** — Linking an attacker's MAC address to a legitimate IP on a local network
- **Man-in-the-Middle** — Intercepting and potentially altering communications between two parties

### Web Application Attacks

The **OWASP Top 10** represents the most critical web application security risks:

1. **Broken Access Control** — Users acting beyond their intended permissions
2. **Cryptographic Failures** — Weak or missing encryption of sensitive data
3. **Injection** — SQL, NoSQL, OS command injection through untrusted input
4. **Insecure Design** — Missing security architecture and threat modeling
5. **Security Misconfiguration** — Default credentials, unnecessary services, verbose error messages

### Insider Threats

Not all threats come from outside the organization:

- **Malicious insiders** — Employees deliberately stealing data or sabotaging systems
- **Negligent insiders** — Careless handling of sensitive information
- **Compromised insiders** — Accounts taken over through phishing or credential stuffing

### Summary

The threat landscape is diverse and constantly evolving. Effective defense requires understanding both the technical attack vectors and the human factors that make them possible.`,
      },
      {
        lessonId: "intro-les-3",
        title: "The CIA Triad: Confidentiality, Integrity, Availability",
        type: "PDF",
        order: 3,
        unlocked: false,
        completed: false,
        watchPct: 0,
        content: `## The CIA Triad

The **CIA Triad** is the foundational model in information security. Every security control, policy, and technology maps to one or more of its three pillars.

### Confidentiality

**Confidentiality** ensures that information is accessible only to authorized individuals. It prevents unauthorized disclosure of sensitive data.

**Key controls:**
- **Encryption** — AES-256 for data at rest, TLS 1.3 for data in transit
- **Access Control** — Role-Based Access Control (RBAC), Principle of Least Privilege
- **Authentication** — Multi-Factor Authentication (MFA), biometrics, certificate-based auth
- **Data Classification** — Public, Internal, Confidential, Restricted labels

**Real-world example:** A healthcare database encrypts patient records (AES-256) and only allows access to doctors with a valid treatment relationship. If a nurse's account is compromised, they still cannot access surgical records.

### Integrity

**Integrity** ensures that data is accurate and has not been tampered with. It covers both data in transit and data at rest.

**Key controls:**
- **Hashing** — SHA-256, SHA-3 for verifying data hasn't been modified
- **Digital Signatures** — Combining hashing with public-key cryptography to prove authorship
- **Version Control** — Tracking changes and maintaining audit trails
- **Checksums** — Verifying file integrity after download or transfer
- **Database Constraints** — Referential integrity, NOT NULL, unique constraints

**Real-world example:** When you download software, the vendor provides a SHA-256 hash. You compute the hash of the downloaded file and compare — if they match, integrity is verified.

### Availability

**Availability** ensures that systems and data are accessible when needed by authorized users. It encompasses reliability, uptime, and disaster recovery.

**Key controls:**
- **Redundancy** — RAID arrays, failover clusters, geographically distributed data centers
- **Load Balancing** — Distributing traffic across multiple servers
- **Backup and Recovery** — Regular backups with tested restoration procedures
- **DDoS Protection** — CDN-based mitigation, rate limiting, traffic scrubbing
- **Disaster Recovery Plan** — RTO (Recovery Time Objective) and RPO (Recovery Point Objective) targets

**Real-world example:** An e-commerce site uses a CDN with 99.99% uptime SLA, auto-scaling groups, and daily backups. During a DDoS attack, traffic is absorbed by the CDN while the origin servers remain protected.

### Beyond the Triad

Modern security frameworks extend the CIA Triad with additional principles:

- **Authentication** — Verifying identity (who are you?)
- **Authorization** — Determining permissions (what can you do?)
- **Non-Repudiation** — Proof that an action was performed (audit logs, digital signatures)
- **Accountability** — Linking actions to specific users

### Summary

The CIA Triad provides a lens through which to evaluate every security decision. When designing a system, ask: Does this protect confidentiality? Does this preserve integrity? Does this ensure availability?`,
      },
      {
        lessonId: "intro-les-4",
        title: "Security Policies and Frameworks",
        type: "PDF",
        order: 4,
        unlocked: false,
        completed: false,
        watchPct: 0,
        content: `## Security Policies and Frameworks

Organizations need structured approaches to manage cybersecurity risk. This lesson covers the major policies, standards, and frameworks used worldwide.

### Security Policies

A **security policy** is a formal document that defines an organization's security goals and the controls in place to achieve them.

**Types of policies:**

| Policy | Purpose |
|--------|---------|
| **Acceptable Use Policy (AUP)** | Defines what users can and cannot do with company resources |
| **Access Control Policy** | Specifies how access to systems and data is granted and revoked |
| **Password Policy** | Sets requirements for password complexity, rotation, and storage |
| **Incident Response Policy** | Outlines procedures for detecting, containing, and recovering from incidents |
| **Data Classification Policy** | Defines data sensitivity levels and handling requirements |
| **Remote Work Policy** | Addresses security requirements for remote access and devices |

### Major Security Frameworks

#### NIST Cybersecurity Framework (CSF)

The **NIST CSF** is the most widely adopted framework, organized around five core functions:

1. **Identify** — Asset management, risk assessment, governance
2. **Protect** — Access control, awareness training, data security, maintenance
3. **Detect** — Anomalies, events, continuous monitoring
4. **Respond** — Response planning, communications, analysis, mitigation
5. **Recover** — Recovery planning, improvements, communications

#### ISO/IEC 27001

The international standard for **Information Security Management Systems (ISMS)**. Key requirements:

- Establish an ISMS based on risk assessment
- Implement controls from Annex A (114 controls in 14 domains)
- Conduct regular internal audits
- Pursue independent certification through third-party auditors

#### CIS Controls

The **Center for Internet Security Critical Security Controls** provide prioritized actions:

1. Inventory of enterprise assets
2. Inventory of software assets
3. Data protection
4. Secure configuration of enterprise assets
5. Account management

#### SOC 2

A compliance framework for service organizations, based on five **Trust Service Criteria**:

- **Security** — Protection against unauthorized access
- **Availability** — System uptime and performance
- **Processing Integrity** — Complete and accurate processing
- **Confidentiality** — Protection of confidential information
- **Privacy** — Handling of personal information

### Building a Security Program

A mature security program includes:

1. **Governance** — Security steering committee, risk register, policy framework
2. **Risk Management** — Regular assessments, risk treatment plans, residual risk acceptance
3. **Technical Controls** — Prevention, detection, and response technologies
4. **Awareness Training** — Regular phishing simulations, security awareness campaigns
5. **Incident Response** — Documented playbooks, tabletop exercises, post-incident reviews
6. **Continuous Improvement** — Metrics, KPIs, lessons learned

### Summary

Frameworks provide the structure; policies provide the rules. Together, they create a comprehensive security program that protects assets and demonstrates compliance.`,
      },
      {
        lessonId: "intro-les-5",
        title: "Knowledge Check: Cybersecurity Fundamentals",
        type: "QUIZ",
        order: 5,
        unlocked: false,
        completed: false,
        watchPct: 0,
        questions: [
          {
            id: "q1",
            question: "What does the 'C' in the CIA Triad stand for?",
            options: ["Compliance", "Confidentiality", "Continuity", "Control"],
            correctIndex: 1,
            explanation: "The CIA Triad stands for Confidentiality, Integrity, and Availability — the three core pillars of information security.",
          },
          {
            id: "q2",
            question: "Which type of phishing targets high-level executives like CEOs?",
            options: ["Smishing", "Vishing", "Whaling", "Pharming"],
            correctIndex: 2,
            explanation: "Whaling is a form of spear phishing specifically targeting C-suite executives and other high-value individuals within an organization.",
          },
          {
            id: "q3",
            question: "What is the primary goal of ransomware?",
            options: ["Steal credentials", "Encrypt files and demand payment", "Launch DDoS attacks", "Spy on users"],
            correctIndex: 1,
            explanation: "Ransomware encrypts a victim's files and demands payment (usually in cryptocurrency) for the decryption key.",
          },
          {
            id: "q4",
            question: "Which NIST CSF function involves continuous monitoring and anomaly detection?",
            options: ["Protect", "Detect", "Respond", "Recover"],
            correctIndex: 1,
            explanation: "The Detect function focuses on identifying cybersecurity events through continuous monitoring and anomaly detection.",
          },
          {
            id: "q5",
            question: "What does 'defense in depth' mean in cybersecurity?",
            options: [
              "Using a single strong firewall",
              "Applying multiple layers of security controls",
              "Hiring more security staff",
              "Encrypting all data at rest",
            ],
            correctIndex: 1,
            explanation: "Defense in depth is the practice of applying multiple layers of security controls so that if one layer fails, others are still in place.",
          },
        ],
      },
    ],
  },

  // ─── Course 2 ──────────────────────────────────────────────────────────
  {
    id: "course-network-security",
    title: "Network Security Fundamentals",
    description:
      "Understand how networks are attacked and defended. Covers firewalls, IDS/IPS, VPNs, and network monitoring techniques.",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    _count: { lessons: 5, enrollments: 0 },
    lessons: [
      {
        lessonId: "net-les-1",
        title: "How Networks Work: TCP/IP Deep Dive",
        type: "PDF",
        order: 1,
        unlocked: true,
        completed: false,
        watchPct: 0,
        content: `## How Networks Work: TCP/IP Deep Dive

To secure networks, you must first understand how they function. The TCP/IP model is the backbone of modern networking.

### The TCP/IP Model

| Layer | Function | Protocols |
|-------|----------|-----------|
| **Application** | User-facing services | HTTP, DNS, SMTP, FTP, SSH |
| **Transport** | End-to-end communication | TCP, UDP |
| **Internet** | Routing and addressing | IP, ICMP, ARP |
| **Network Access** | Physical transmission | Ethernet, Wi-Fi, PPP |

### TCP vs UDP

**TCP (Transmission Control Protocol)** — Reliable, connection-oriented:
- Three-way handshake: SYN → SYN-ACK → ACK
- Guarantees delivery, ordering, and error checking
- Used for: HTTP, SSH, SMTP, FTP

**UDP (User Datagram Protocol)** — Fast, connectionless:
- No handshake, no guaranteed delivery
- Lower latency, used for real-time applications
- Used for: DNS queries, video streaming, VoIP, gaming

### IP Addressing

- **IPv4** — 32-bit addresses (e.g., 192.168.1.1), ~4.3 billion addresses
- **IPv6** — 128-bit addresses (e.g., 2001:db8::1), virtually unlimited
- **Subnetting** — Dividing networks into smaller segments using subnet masks
- **CIDR Notation** — e.g., 192.168.1.0/24 (24 network bits, 256 addresses)

### DNS (Domain Name System)

DNS translates domain names to IP addresses:
1. Browser checks local cache
2. OS checks hosts file and resolver cache
3. Recursive resolver queries root servers → TLD servers → authoritative servers
4. Result cached at each level (TTL-based)

**DNS attacks to know:**
- DNS cache poisoning
- DNS amplification (DDoS)
- DNS tunneling (data exfiltration)

### Ports and Sockets

Well-known ports:
| Port | Service |
|------|---------|
| 22 | SSH |
| 25 | SMTP |
| 53 | DNS |
| 80 | HTTP |
| 443 | HTTPS |
| 3306 | MySQL |
| 5432 | PostgreSQL |

### Summary

Understanding TCP/IP is foundational for network security. Every firewall rule, IDS signature, and packet capture is built on these concepts.`,
      },
      {
        lessonId: "net-les-2",
        title: "Firewalls and Access Control Lists",
        type: "PDF",
        order: 2,
        unlocked: false,
        completed: false,
        watchPct: 0,
        content: `## Firewalls and Access Control Lists

Firewalls are the first line of defense in network security, controlling what traffic enters and leaves a network.

### Types of Firewalls

| Type | How It Works | OSI Layer |
|------|-------------|-----------|
| **Packet Filtering** | Examines header (src/dst IP, port) against rules | Network (3) |
| **Stateful Inspection** | Tracks connection state (SYN, ESTABLISHED, etc.) | Network + Transport |
| **Application Gateway (Proxy)** | Inspects payload at the application level | Application (7) |
| **Next-Generation (NGFW)** | Deep packet inspection + IPS + application awareness | All layers |

### Stateful Firewall Rule Example

\`\`\`
# Allow outbound web traffic
ALLOW TCP 10.0.0.0/8 → ANY port 80,443 ESTABLISHED

# Block inbound except established
DENY ANY → 10.0.0.0/8 port 22 (unless ESTABLISHED)

# Allow SSH from management network only
ALLOW TCP 10.10.0.0/24 → 10.0.0.5 port 22
\`\`\`

### DMZ (Demilitarized Zone)

A DMZ is a network segment between the internal network and the internet:

\`\`\`
Internet ←→ [Firewall] ←→ DMZ (web servers, mail)
                         ↕
                    [Internal Firewall]
                         ↕
                    Internal Network (databases, users)
\`\`\`

Services exposed to the internet sit in the DMZ, isolated from the internal network.

### Network Segmentation

Dividing a network into segments limits lateral movement:

- **VLANs** — Virtual LANs for logical separation
- **Micro-segmentation** — Granular controls at the workload level
- **Zero Trust** — Never trust, always verify — every connection is authenticated

### Summary

Firewalls and ACLs form the perimeter defense. Modern approaches combine traditional firewalls with segmentation and zero-trust principles for defense in depth.`,
      },
      {
        lessonId: "net-les-3",
        title: "Intrusion Detection and Prevention Systems",
        type: "PDF",
        order: 3,
        unlocked: false,
        completed: false,
        watchPct: 0,
        content: `## Intrusion Detection and Prevention Systems

IDS and IPS monitor network traffic for suspicious activity, but they serve different roles.

### IDS vs IPS

| Feature | IDS (Detection) | IPS (Prevention) |
|---------|-----------------|-------------------|
| **Placement** | Passive (taps/mirrors) | Inline (in the traffic path) |
| **Action** | Alerts only | Alerts + blocks/drops |
| **Impact on traffic** | None | Can introduce latency |
| **False positive risk** | Lower (no blocking) | Higher (may block legitimate traffic) |

### Detection Methods

**Signature-Based Detection**
- Matches traffic against known attack signatures (like antivirus)
- Pros: Low false positive rate for known attacks
- Cons: Cannot detect zero-day attacks or variants

**Anomaly-Based Detection**
- Builds a baseline of "normal" traffic, flags deviations
- Pros: Can detect unknown attacks
- Cons: Higher false positive rate, requires training period

**Stateful Protocol Analysis**
- Compares observed events against pre-defined profiles of legitimate protocol behavior
- Pros: Detects protocol violations
- Cons: Resource-intensive, protocol-specific

### Popular IDS/IPS Tools

- **Snort** — Open-source, signature and anomaly-based
- **Suricata** — High-performance, multi-threaded, compatible with Snort rules
- **Zeek (Bro)** — Network analysis framework, generates rich logs
- **OSSEC** — Host-based IDS with log analysis and file integrity monitoring

### Writing Basic Snort Rules

\`\`\`
# Detect SQL injection attempt
alert http any any -> $HOME_NET 80 (msg:"SQL Injection"; content:"SELECT"; nocase; sid:1000001; rev:1;)

# Detect port scanning
alert tcp any any -> $HOME_NET any (flags:S; threshold:type threshold, track by_src, count 20, seconds 60; sid:1000002; rev:1;)
\`\`\`

### Summary

IDS/IPS are essential for detecting attacks that bypass perimeter defenses. A well-tuned system provides visibility into network threats and early warning of breaches.`,
      },
      {
        lessonId: "net-les-4",
        title: "VPNs and Secure Tunneling",
        type: "PDF",
        order: 4,
        unlocked: false,
        completed: false,
        watchPct: 0,
        content: `## VPNs and Secure Tunneling

Virtual Private Networks create encrypted tunnels over public networks, enabling secure remote access.

### Types of VPNs

| Type | Use Case | Protocol |
|------|----------|----------|
| **Remote Access** | Individual user → corporate network | OpenVPN, WireGuard, IPSec |
| **Site-to-Site** | Connecting two office networks | IPSec, GRE |
| **SSL/TLS VPN** | Browser-based remote access | HTTPS (port 443) |

### WireGuard Protocol

WireGuard is a modern, lightweight VPN protocol:
- Uses **Noise Protocol Framework** for key exchange
- ChaCha20 for encryption, Poly1305 for authentication
- Runs in the kernel space (Linux) for high performance
- Only ~4,000 lines of code (vs. ~600,000 for OpenVPN)

### IPSec VPN

Two modes:
- **Transport Mode** — Encrypts only the payload (host-to-host)
- **Tunnel Mode** — Encrypts the entire original packet (gateway-to-gateway)

Two phases:
- **Phase 1 (IKE)** — Establishes a secure channel, authenticates peers
- **Phase 2 (IPSec)** — Negotiates the actual data tunnel (ESP or AH)

### Split Tunneling vs Full Tunnel

- **Full Tunnel** — All traffic goes through the VPN (more secure, higher bandwidth use)
- **Split Tunnel** — Only corporate traffic goes through VPN, internet traffic goes direct (less secure, more efficient)

### Zero Trust Network Access (ZTNA)

Modern alternative to traditional VPNs:
- No implicit trust based on network location
- Identity-based access (device posture, user identity, context)
- Least-privilege access per application
- Examples: Cloudflare Access, Tailscale, Zscaler

### Summary

VPNs remain essential for secure remote access, but ZTNA is increasingly replacing traditional VPN architectures for better security and user experience.`,
      },
      {
        lessonId: "net-les-5",
        title: "Network Security Quiz",
        type: "QUIZ",
        order: 5,
        unlocked: false,
        completed: false,
        watchPct: 0,
        questions: [
          {
            id: "q1",
            question: "Which TCP/IP layer handles routing and IP addressing?",
            options: ["Application", "Transport", "Internet", "Network Access"],
            correctIndex: 2,
            explanation: "The Internet layer handles IP addressing and routing. It uses protocols like IP, ICMP, and ARP.",
          },
          {
            id: "q2",
            question: "What is the difference between IDS and IPS?",
            options: [
              "IDS blocks traffic, IPS only alerts",
              "IPS is inline and can block, IDS is passive and only alerts",
              "There is no difference",
              "IDS is hardware, IPS is software",
            ],
            correctIndex: 1,
            explanation: "An IDS monitors traffic passively and sends alerts, while an IPS sits inline and can actively block or drop malicious traffic.",
          },
          {
            id: "q3",
            question: "Which type of firewall tracks the state of active connections?",
            options: ["Packet filtering", "Stateful inspection", "Application proxy", "Circuit-level gateway"],
            correctIndex: 1,
            explanation: "Stateful inspection firewalls track the state of connections (SYN, ESTABLISHED, etc.) to make more informed filtering decisions.",
          },
          {
            id: "q4",
            question: "What is a DMZ in network security?",
            options: [
              "A type of encryption",
              "A network segment between the internal network and the internet",
              "A firewall rule",
              "A VPN protocol",
            ],
            correctIndex: 1,
            explanation: "A DMZ (Demilitarized Zone) is a network segment that sits between the internal network and the internet, hosting publicly accessible services while isolating them from internal resources.",
          },
          {
            id: "q5",
            question: "Which modern VPN protocol uses the Noise Protocol Framework?",
            options: ["OpenVPN", "PPTP", "WireGuard", "L2TP"],
            correctIndex: 2,
            explanation: "WireGuard uses the Noise Protocol Framework for key exchange, ChaCha20 for encryption, and runs in kernel space for high performance.",
          },
        ],
      },
    ],
  },

  // ─── Course 3 ──────────────────────────────────────────────────────────
  {
    id: "course-ethical-hacking",
    title: "Ethical Hacking and Penetration Testing",
    description:
      "Step into the attacker's shoes. Learn reconnaissance, scanning, exploitation, and reporting — the full penetration testing lifecycle.",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    _count: { lessons: 5, enrollments: 0 },
    lessons: [
      {
        lessonId: "hack-les-1",
        title: "Reconnaissance: Passive and Active Information Gathering",
        type: "PDF",
        order: 1,
        unlocked: true,
        completed: false,
        watchPct: 0,
        content: `## Reconnaissance: Information Gathering

Reconnaissance is the first phase of any penetration test. The goal is to gather as much information as possible about the target before launching an attack.

### Passive Reconnaissance

Gathering information **without directly interacting** with the target:

| Technique | Tools |
|-----------|-------|
| **OSINT** | Google dorking, Shodan, Censys |
| **DNS enumeration** | dig, nslookup, dnsrecon |
| **WHOIS lookups** | whois, RDAP |
| **Social media** | LinkedIn, Twitter, GitHub |
| **Certificate transparency** | crt.sh, Censys certificates |

### Active Reconnaissance

**Directly interacting** with the target (more detectable):

| Technique | Tools |
|-----------|-------|
| **Port scanning** | Nmap, Masscan, Unicornscan |
| **Service enumeration** | Nmap scripts (-sC), Banner grabbing |
| **Web crawling** | Gobuster, Dirb, Ffuf |
| **Vulnerability scanning** | Nessus, OpenVAS, Nikto |

### Google Dorking Examples

\`\`\`
site:target.com filetype:pdf         # Find PDFs on the target
intitle:"index of" "parent directory" # Find open directories
site:target.com inurl:admin          # Find admin panels
\`\`\`

### Nmap Basics

\`\`\`bash
# Quick scan
nmap -sV -sC target.com

# Full port scan
nmap -p- -T4 target.com

# OS detection
nmap -O target.com

# Script scan (vulnerability detection)
nmap --script vuln target.com
\`\`\`

### Summary

Reconnaissance is the foundation of a successful penetration test. The more information you gather, the more attack vectors you can identify.`,
      },
      {
        lessonId: "hack-les-2",
        title: "Scanning and Enumeration with Nmap",
        type: "PDF",
        order: 2,
        unlocked: false,
        completed: false,
        watchPct: 0,
        content: `## Scanning and Enumeration

Scanning goes beyond basic reconnaissance to map the target's attack surface in detail.

### Nmap Scan Types

| Scan Type | Flag | Description |
|-----------|------|-------------|
| TCP Connect | \`-sT\` | Completes the 3-way handshake |
| SYN Stealth | \`-sS\` | Sends SYN, reads response (stealthier) |
| UDP Scan | \`-sU\` | Scans for open UDP ports (slower) |
| Ping Sweep | \`-sn\` | Discovers live hosts without port scanning |
| Version Detection | \`-sV\` | Identifies service versions |

### NSE (Nmap Scripting Engine)

NSE scripts extend Nmap's capabilities:

\`\`\`bash
# Discover SMB shares
nmap --script smb-enum-shares -p 445 target

# Check for SQL injection
nmap --script http-sql-injection -p 80 target

# Enumerate DNS records
nmap --script dns-brute target.com

# Check for SSL vulnerabilities
nmap --script ssl-heartbleed -p 443 target
\`\`\`

### Vulnerability Assessment

After scanning, categorize findings by severity:

| Severity | CVSS Score | Action |
|----------|------------|--------|
| **Critical** | 9.0-10.0 | Immediate remediation |
| **High** | 7.0-8.9 | Remediate within 7 days |
| **Medium** | 4.0-6.9 | Remediate within 30 days |
| **Low** | 0.1-3.9 | Best-effort remediation |

### Summary

Systematic scanning and enumeration reveals the specific vulnerabilities that can be targeted during the exploitation phase.`,
      },
      {
        lessonId: "hack-les-3",
        title: "Exploitation Basics",
        type: "PDF",
        order: 3,
        unlocked: false,
        completed: false,
        watchPct: 0,
        content: `## Exploitation Basics

Exploitation is the process of taking advantage of identified vulnerabilities to gain unauthorized access.

### Common Exploit Categories

| Category | Example |
|----------|---------|
| **Web Application** | SQL injection, XSS, CSRF, file upload |
| **Network** | EternalBlue (MS17-010), BlueKeep (RDP) |
| **Authentication** | Brute force, credential stuffing, default passwords |
| **Privilege Escalation** | Kernel exploits, misconfigured SUID binaries |

### SQL Injection Example

\`\`\`sql
-- Normal query
SELECT * FROM users WHERE email = 'user@example.com' AND password = 'hash'

-- Injected query (attacker enters: ' OR '1'='1' --)
SELECT * FROM users WHERE email = '' OR '1'='1' --' AND password = ''
-- Returns ALL users (authentication bypass)
\`\`\`

### Cross-Site Scripting (XSS)

- **Reflected** — Malicious script in URL parameters, executed when page loads
- **Stored** — Script stored in database (e.g., forum post), executes for all viewers
- **DOM-Based** — Client-side JavaScript manipulation

### Metasploit Framework

The most widely used exploitation framework:

\`\`\`bash
# Search for exploits
msfconsole
search eternalblue

# Use an exploit
use exploit/windows/smb/ms17_010_eternalblue

# Configure options
set RHOSTS target
set PAYLOAD windows/x64/meterpreter/reverse_tcp

# Execute
exploit
\`\`\`

### Responsible Disclosure

When finding vulnerabilities:
1. **Document** everything (steps, screenshots, impact)
2. **Report** to the vendor (don't exploit in production)
3. **Allow time** for remediation before public disclosure
4. **Follow** responsible disclosure timelines (typically 90 days)

### Summary

Exploitation requires both technical skill and ethical responsibility. Always operate within authorized scope and follow responsible disclosure practices.`,
      },
      {
        lessonId: "hack-les-4",
        title: "Writing a Penetration Test Report",
        type: "PDF",
        order: 4,
        unlocked: false,
        completed: false,
        watchPct: 0,
        content: `## Writing a Penetration Test Report

The report is the most important deliverable of a penetration test. It communicates findings to both technical teams and executive leadership.

### Report Structure

1. **Executive Summary** — Non-technical overview for leadership
2. **Scope and Methodology** — What was tested, how, and when
3. **Findings** — Detailed vulnerabilities with evidence
4. **Recommendations** — Prioritized remediation steps
5. **Appendices** — Raw data, tool output, references

### Executive Summary Template

\`\`\`
During the engagement period of [dates], [Company] conducted a
penetration test targeting [scope]. [X] critical, [Y] high,
[Z] medium, and [W] low severity vulnerabilities were identified.

The most critical finding allows unauthenticated remote code
execution on the public-facing web server, which should be
addressed immediately.
\`\`\`

### Finding Template

Each finding should include:
- **Title** — Concise description
- **Severity** — Critical/High/Medium/Low with CVSS score
- **Description** — What the vulnerability is
- **Impact** — What an attacker could achieve
- **Evidence** — Screenshots, request/response, proof-of-concept
- **Remediation** — Specific steps to fix

### Severity Classification

| Rating | CVSS | Description |
|--------|------|-------------|
| Critical | 9.0-10.0 | Immediate exploitation, severe impact |
| High | 7.0-8.9 | Significant impact, relatively easy to exploit |
| Medium | 4.0-6.9 | Moderate impact or requires specific conditions |
| Low | 0.1-3.9 | Minimal impact, defense-in-depth improvement |

### Summary

A great report tells a story: what was found, why it matters, and how to fix it. The best technical findings are useless if the report doesn't motivate action.`,
      },
      {
        lessonId: "hack-les-5",
        title: "Penetration Testing Knowledge Check",
        type: "QUIZ",
        order: 5,
        unlocked: false,
        completed: false,
        watchPct: 0,
        questions: [
          {
            id: "q1",
            question: "What is the first phase of a penetration test?",
            options: ["Scanning", "Exploitation", "Reconnaissance", "Reporting"],
            correctIndex: 2,
            explanation: "Reconnaissance is always the first phase — gathering information about the target before any active scanning or exploitation.",
          },
          {
            id: "q2",
            question: "Which Nmap scan type completes the TCP 3-way handshake?",
            options: ["SYN stealth scan (-sS)", "TCP connect scan (-sT)", "UDP scan (-sU)", "Ping sweep (-sn)"],
            correctIndex: 1,
            explanation: "The TCP connect scan (-sT) completes the full 3-way handshake (SYN → SYN-ACK → ACK), making it the most reliable but also most detectable scan type.",
          },
          {
            id: "q3",
            question: "What does SQL injection allow an attacker to do?",
            options: [
              "Install malware on the server",
              "Execute arbitrary SQL queries on the database",
              "Intercept network traffic",
              "Bypass firewall rules",
            ],
            correctIndex: 1,
            explanation: "SQL injection allows an attacker to inject malicious SQL code into queries, potentially reading, modifying, or deleting database data.",
          },
          {
            id: "q4",
            question: "What is the recommended disclosure timeline for a found vulnerability?",
            options: ["24 hours", "7 days", "30 days", "90 days"],
            correctIndex: 3,
            explanation: "The industry standard responsible disclosure timeline is typically 90 days, giving the vendor adequate time to develop and deploy a fix.",
          },
        ],
      },
    ],
  },

  // ─── Course 4 ──────────────────────────────────────────────────────────
  {
    id: "course-incident-response",
    title: "Incident Response and Digital Forensics",
    description:
      "Master the art of responding to security breaches. Learn incident handling procedures, evidence collection, and forensic analysis techniques.",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    _count: { lessons: 4, enrollments: 0 },
    lessons: [
      {
        lessonId: "ir-les-1",
        title: "Incident Response Lifecycle",
        type: "PDF",
        order: 1,
        unlocked: true,
        completed: false,
        watchPct: 0,
        content: `## Incident Response Lifecycle

The NIST SP 800-61 standard defines four phases of incident response:

### Phase 1: Preparation

Before an incident occurs:
- **Incident Response Plan** — Documented procedures, roles, and contacts
- **IR Team** — Designated responders with defined responsibilities
- **Tools and Infrastructure** — SIEM, log management, forensic workstations
- **Training** — Tabletop exercises, simulations, awareness programs
- **Communication Plan** — Internal and external notification procedures

### Phase 2: Detection and Analysis

Identifying and understanding the incident:
- **Alert Sources** — SIEM, IDS/IPS, antivirus, user reports, threat intel
- **Triage** — Determine severity, scope, and urgency
- **Documentation** — Timeline, evidence, actions taken (chain of custody)
- **Analysis** — Root cause, attack vector, affected systems

### Phase 3: Containment, Eradication, and Recovery

**Containment** (stop the bleeding):
- Short-term: Isolate affected systems, block malicious IPs
- Long-term: Apply patches, change credentials, segment network

**Eradication** (remove the threat):
- Remove malware, close backdoors, restore from clean backups
- Verify all indicators of compromise (IOCs) are addressed

**Recovery** (restore operations):
- Restore systems from verified clean backups
- Monitor for re-infection
- Gradually return to normal operations

### Phase 4: Post-Incident Activity

- **Lessons Learned** — What went well, what didn't, what to improve
- **Metrics** — MTTD (Mean Time to Detect), MTTR (Mean Time to Respond)
- **Documentation Updates** — Update playbooks based on findings
- **Threat Intelligence** — Share IOCs with industry partners (ISACs)

### Summary

Incident response is not about preventing all incidents — it's about minimizing impact and learning from each event to improve future response.`,
      },
      {
        lessonId: "ir-les-2",
        title: "Digital Evidence Collection and Chain of Custody",
        type: "PDF",
        order: 2,
        unlocked: false,
        completed: false,
        watchPct: 0,
        content: `## Digital Evidence Collection

Proper evidence handling is critical for both incident response and potential legal proceedings.

### Evidence Types

| Type | Source | Volatility |
|------|--------|------------|
| **Memory** | RAM dump | Most volatile — lost on power off |
| **Network** | Packet captures, logs | Ephemeral |
| **Disk** | Hard drive, SSD image | Persistent |
| **Log files** | SIEM, OS logs, app logs | May rotate or be deleted |

### Order of Volatility

Always collect evidence in order from most to least volatile:
1. CPU registers and cache
2. Routing tables, ARP cache, process tables
3. RAM (memory dump)
4. Temporary file systems
5. Disk/SSD
6. Remote logging and monitoring data
7. Archival media (backups, tapes)

### Chain of Custody

Every piece of evidence must be tracked:

| Field | Description |
|-------|-------------|
| **Evidence ID** | Unique identifier |
| **Description** | What the evidence is |
| **Date/Time Collected** | When it was acquired |
| **Collected By** | Who acquired it |
| **Storage Location** | Where it's stored |
| **Access Log** | Every person who accessed it |

### Forensic Imaging

**Best practices for disk imaging:**
1. Work from a write-blocker to prevent modification
2. Create a bit-for-bit (forensic) image, not a file copy
3. Calculate and record hash values (MD5 + SHA-256) before and after
4. Store the original media in a secure, tamper-evident bag
5. Work from the image, never the original

### Summary

Evidence that isn't properly collected and documented may be inadmissible in court. Follow established procedures to maintain the integrity of digital evidence.`,
      },
      {
        lessonId: "ir-les-3",
        title: "Forensic Analysis: Disk and Memory Imaging",
        type: "PDF",
        order: 3,
        unlocked: false,
        completed: false,
        watchPct: 0,
        content: `## Forensic Analysis

Forensic analysis involves systematically examining digital evidence to reconstruct events and identify indicators of compromise.

### Memory Forensics

Memory analysis reveals what was happening at the time of capture:

**Tools:**
- **Volatility** — The gold standard for memory analysis
- **Rekall** — Google's memory forensics framework

**Key artifacts in memory:**
- Running processes and command-line arguments
- Network connections and open sockets
- Injected code and rootkits
- Encryption keys and passwords
- Clipboard contents

\`\`\`bash
# Volatility analysis workflow
volatility -f memory.dump imageinfo
volatility -f memory.dump --profile=Win10x64 pslist
volatility -f memory.dump --profile=Win10x64 netscan
volatility -f memory.dump --profile=Win10x64 filescan
\`\`\`

### Disk Forensics

**Key artifacts to examine:**
- **File System** — NTFS $MFT, EXT journal, deleted files
- **Registry** — Windows registry hives (user activity, persistence)
- **Browser History** — Visited URLs, downloads, cookies
- **Prefetch/Amcache** — Program execution evidence
- **Event Logs** — Windows Event Logs, syslog

### Timeline Analysis

Building a chronological sequence of events:

1. Collect timestamps from all sources (file system, registry, logs)
2. Normalize to UTC
3. Correlate events across sources
4. Identify suspicious patterns

### Tools

| Tool | Purpose |
|------|---------|
| **Autopsy** | Open-source disk forensics platform |
| **FTK Imager** | Forensic imaging and basic analysis |
| **KAPE** | Triage collection and analysis |
| **Eric Zimmerman Tools** | Windows forensic analysis suite |

### Summary

Forensic analysis combines technical skill with methodical procedure. The goal is to tell the story of what happened, who did it, and what evidence supports your conclusions.`,
      },
      {
        lessonId: "ir-les-4",
        title: "Incident Response Knowledge Check",
        type: "QUIZ",
        order: 4,
        unlocked: false,
        completed: false,
        watchPct: 0,
        questions: [
          {
            id: "q1",
            question: "In what order should digital evidence be collected?",
            options: [
              "Disk first, then memory",
              "From least volatile to most volatile",
              "From most volatile to least volatile",
              "It doesn't matter",
            ],
            correctIndex: 2,
            explanation: "Evidence should be collected from most volatile to least volatile (memory before disk) because the most volatile data is lost first.",
          },
          {
            id: "q2",
            question: "What are the four phases of the NIST incident response lifecycle?",
            options: [
              "Plan, Execute, Review, Close",
              "Preparation, Detection/Analysis, Containment/Eradication/Recovery, Post-Incident",
              "Identify, Protect, Detect, Respond",
              "Alert, Contain, Eradicate, Recover",
            ],
            correctIndex: 1,
            explanation: "NIST SP 800-61 defines: Preparation → Detection & Analysis → Containment, Eradication & Recovery → Post-Incident Activity.",
          },
          {
            id: "q3",
            question: "Why is chain of custody important for digital evidence?",
            options: [
              "It makes the investigation faster",
              "It ensures evidence integrity and admissibility in court",
              "It prevents evidence from being deleted",
              "It is only required for law enforcement",
            ],
            correctIndex: 1,
            explanation: "Chain of custody documents who handled the evidence and when, ensuring its integrity and making it admissible in legal proceedings.",
          },
          {
            id: "q4",
            question: "What tool is the gold standard for memory forensics?",
            options: ["Wireshark", "Volatility", "Nmap", "Metasploit"],
            correctIndex: 1,
            explanation: "Volatility is the industry-standard open-source framework for analyzing RAM memory dumps to extract running processes, network connections, and other artifacts.",
          },
        ],
      },
    ],
  },
];

/** Find a course by ID */
export function getHardcodedCourse(id: string): HardcodedCourse | undefined {
  return hardcodedCourses.find((c) => c.id === id);
}

/** Find a lesson within a course */
export function getHardcodedLesson(
  courseId: string,
  lessonId: string,
): { course: HardcodedCourse; lesson: HardcodedLesson } | undefined {
  const course = hardcodedCourses.find((c) => c.id === courseId);
  if (!course) return undefined;
  const lesson = course.lessons.find((l) => l.lessonId === lessonId);
  if (!lesson) return undefined;
  return { course, lesson };
}

/** Return published courses for the learner browse page */
export function getPublishedCourses(): HardcodedCourse[] {
  return hardcodedCourses.filter((c) => c.status === "PUBLISHED");
}
