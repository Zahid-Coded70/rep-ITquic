export type Question = {
  category: "Networking" | "PC Hardware" | "IP Address" | "Subnetting";
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

export const QUESTIONS: Question[] = [
  // ========== NETWORKING ==========
  {
    category: "Networking",
    q: "Which OSI layer is responsible for routing packets between networks?",
    options: ["Data Link", "Network", "Transport", "Session"],
    answer: 1,
    explain:
      "The Network layer (Layer 3) handles logical addressing and routing — IP lives here.",
  },
  {
    category: "Networking",
    q: "Which protocol uses port 443 by default?",
    options: ["HTTP", "FTP", "HTTPS", "SMTP"],
    answer: 2,
    explain: "HTTPS (HTTP over TLS) uses port 443. HTTP is 80, FTP is 21, SMTP is 25.",
  },
  {
    category: "Networking",
    q: "What is the primary function of a DNS server?",
    options: [
      "Assign IP addresses to devices",
      "Translate domain names to IP addresses",
      "Filter network traffic",
      "Encrypt data in transit",
    ],
    answer: 1,
    explain:
      "DNS resolves human-readable names like example.com to IP addresses. DHCP assigns IPs.",
  },
  {
    category: "Networking",
    q: "Which device operates primarily at Layer 2 of the OSI model?",
    options: ["Router", "Switch", "Hub", "Firewall"],
    answer: 1,
    explain:
      "A switch forwards frames using MAC addresses (Layer 2). Hubs are Layer 1; routers are Layer 3.",
  },

  // ========== PC HARDWARE ==========
  {
    category: "PC Hardware",
    q: "Which component is considered the 'brain' of the computer?",
    options: ["RAM", "GPU", "CPU", "SSD"],
    answer: 2,
    explain: "The CPU (Central Processing Unit) executes instructions and is the main processor.",
  },
  {
    category: "PC Hardware",
    q: "What does RAM stand for?",
    options: [
      "Read Access Memory",
      "Random Access Memory",
      "Rapid Available Memory",
      "Runtime Application Memory",
    ],
    answer: 1,
    explain: "RAM = Random Access Memory. Volatile memory used for active data and running programs.",
  },
  {
    category: "PC Hardware",
    q: "Which storage type has no moving parts and offers the fastest read/write speeds?",
    options: ["HDD", "SSD", "Optical Disc", "Magnetic Tape"],
    answer: 1,
    explain: "SSDs use flash memory — no spinning platters, much faster than mechanical HDDs.",
  },
  {
    category: "PC Hardware",
    q: "Which connector is commonly used to connect a modern GPU to a monitor at high refresh rates?",
    options: ["VGA", "DisplayPort", "PS/2", "RJ-45"],
    answer: 1,
    explain:
      "DisplayPort supports high resolutions and refresh rates. VGA is analog/legacy; RJ-45 is for Ethernet.",
  },

  // ========== IP ADDRESS ==========
  {
    category: "IP Address",
    q: "Which of the following is a valid private IPv4 address?",
    options: ["8.8.8.8", "172.16.5.10", "203.0.113.5", "169.254.10.1"],
    answer: 1,
    explain:
      "172.16.0.0/12 is private (RFC 1918). 169.254.x is APIPA, and 8.8.8.8 / 203.x are public.",
  },
  {
    category: "IP Address",
    q: "How many bits are in an IPv6 address?",
    options: ["32", "64", "128", "256"],
    answer: 2,
    explain: "IPv6 uses 128-bit addresses, written as 8 groups of 4 hex digits. IPv4 is 32 bits.",
  },
  {
    category: "IP Address",
    q: "What is the loopback address in IPv4?",
    options: ["0.0.0.0", "127.0.0.1", "192.168.1.1", "255.255.255.255"],
    answer: 1,
    explain: "127.0.0.1 (the entire 127.0.0.0/8 block) is reserved for loopback — your own machine.",
  },
  {
    category: "IP Address",
    q: "Which class did the IP address 192.168.1.10 traditionally belong to?",
    options: ["Class A", "Class B", "Class C", "Class D"],
    answer: 2,
    explain:
      "192–223 in the first octet = Class C. (Classful addressing is largely replaced by CIDR today.)",
  },

  // ========== SUBNETTING ==========
  {
    category: "Subnetting",
    q: "What is the subnet mask for a /24 network?",
    options: ["255.255.0.0", "255.255.255.0", "255.255.255.128", "255.255.255.255"],
    answer: 1,
    explain: "/24 means 24 bits set: 255.255.255.0 — the classic Class C mask.",
  },
  {
    category: "Subnetting",
    q: "How many usable host addresses are available in a /28 subnet?",
    options: ["6", "14", "16", "30"],
    answer: 1,
    explain: "/28 leaves 4 host bits → 2^4 = 16 addresses, minus network and broadcast = 14 usable.",
  },
  {
    category: "Subnetting",
    q: "Which address is the broadcast address for the 192.168.10.0/24 network?",
    options: ["192.168.10.0", "192.168.10.1", "192.168.10.254", "192.168.10.255"],
    answer: 3,
    explain: "In a /24, the last address (.255) is the broadcast. .0 is the network address.",
  },
  {
    category: "Subnetting",
    q: "If you need to support at least 60 hosts per subnet, what is the smallest subnet mask you can use?",
    options: ["/24", "/25", "/26", "/27"],
    answer: 2,
    explain:
      "/26 gives 2^6 - 2 = 62 usable hosts. /27 only gives 30, so /26 is the smallest that fits 60+.",
  },
];
