/* =====================================================================
   projets.js : TOUTES les réalisations du portfolio, au même endroit.

   Pour ajouter une réalisation : copier un bloc { ... }, le coller à la
   fin de la liste et modifier le texte. La grille des réalisations, la
   fenêtre de détail et le tableau de synthèse E5 se mettent à jour seuls.

   Champs facultatifs :
   - missions   : liste simple, affichée sous le titre « Missions »
   - details    : rubriques libres, chacune { titre, texte } ou { titre, liste }
   - documents  : fichiers liés, chacun { label, href, telecharger: true/false }
   ===================================================================== */

/* Les 6 compétences du bloc 1 du BTS SIO (colonnes du tableau E5) */
const COMPETENCES = {
  "B1.1": "Gérer le patrimoine informatique",
  "B1.2": "Répondre aux incidents et aux demandes d'assistance et d'évolution",
  "B1.3": "Développer la présence en ligne de l'organisation",
  "B1.4": "Travailler en mode projet",
  "B1.5": "Mettre à disposition des utilisateurs un service informatique",
  "B1.6": "Organiser son développement professionnel"
};

const PROJETS = [
  {
    ref: "RP-01",
    titre: "Déploiement de terminaux mobiles par MDM",
    cadre: "Alternance",
    lieu: "ZETES France, Antony",
    periode: "sept. 2023 – juin 2025",
    resume: "Préparation et configuration de 3 à 300 terminaux Honeywell et Zebra par commande, via le MDM SOTI, pour Carrefour, DHL, Renault…",
    contexte: "ZETES prépare et configure des terminaux mobiles industriels (terminaux de poche, PDA, tablettes Honeywell et Zebra) pour des clients de la grande distribution, de la logistique et de l'industrie : Boulanger, Carrefour, DHL, Lactalis, Renault, Brink's, ainsi que des commerçants indépendants. Les commandes allaient de 3 à 300 terminaux, livrés surtout en France et parfois à l'étranger. La réception et l'expédition des colis étaient gérées par un service logistique dédié.",
    details: [
      { titre: "Mon rôle", texte: "Pendant deux ans d'alternance, je préparais les terminaux avant leur livraison (mise à jour, configuration dans le MDM, tests, traçabilité), puis j'assurais le support auprès des clients et des fournisseurs une fois le matériel déployé." },
      { titre: "Procédure de préparation", liste: [
        "Prise en charge des terminaux et vérification du matériel",
        "Étiquetage et enregistrement dans le fichier de suivi Excel pour la traçabilité",
        "Installation des mises à jour du système Android",
        "Inscription du terminal dans le MDM SOTI",
        "Application du profil du client : applications, paramètres, mode kiosque",
        "Tests et validation de la configuration avant le déploiement à grande échelle",
        "Remise des terminaux au service logistique pour l'expédition"
      ] },
      { titre: "Mes actions dans SOTI", liste: [
        "Création de profils de configuration",
        "Déploiement (« push ») d'applications sur les terminaux",
        "Verrouillage des terminaux en mode kiosque",
        "Prise de contrôle à distance d'un terminal pour aider au support",
        "Déplacement des terminaux vers le bon groupe du réseau du client"
      ] },
      { titre: "À savoir", texte: "Certaines actions dans SOTI, irréversibles sur le parc d'un client, étaient réservées aux techniciens confirmés. J'ai appris à travailler dans ce cadre et à faire valider les opérations sensibles." },
      { titre: "Problèmes rencontrés et solutions", liste: [
        "Terminal qui ne s'inscrit pas dans SOTI : connexion du terminal à la console SOTI pour diagnostiquer et corriger son inscription depuis l'interface",
        "Mise à jour Android qui échoue : réinitialisation du terminal aux paramètres d'usine, puis reprise complète de la procédure",
        "Incident matériel : suivi du dossier avec le fournisseur (Honeywell ou Zebra) jusqu'à la résolution"
      ] }
    ],
    outils: ["MDM SOTI", "Android", "Honeywell", "Zebra", "Excel"],
    competences: ["B1.1", "B1.2", "B1.5"],
    documents: [
      { label: "Voir la présentation et la procédure (PDF)", href: "RP-01-ZETES-Deploiement-terminaux-MDM.pdf" },
      { label: "PowerPoint (.pptx)", href: "RP-01-ZETES-Deploiement-terminaux-MDM.pptx", telecharger: true }
    ]
  },
  {
    ref: "RP-02",
    titre: "Infrastructure Active Directory",
    cadre: "Formation",
    lieu: "IPSSI, Serris",
    periode: "2025 – 2026 · laboratoire VMware",
    resume: "Domaine novaconseil.local pour une PME de 40 salariés : deux contrôleurs de domaine, DNS, DHCP, partages par service et GPO.",
    contexte: "Nova Conseil, PME fictive de 40 salariés répartis en 3 services (Direction, Comptabilité, Commercial), fonctionne sans serveur central : un compte différent sur chaque poste, des fichiers échangés par clé USB et aucun contrôle des accès.",
    details: [
      { titre: "Objectifs", liste: [
        "Un compte unique par salarié, géré au même endroit",
        "Des adresses IP attribuées automatiquement",
        "Des dossiers partagés, protégés par service",
        "Des postes configurés automatiquement",
        "Un service qui continue si un serveur tombe en panne"
      ] },
      { titre: "Architecture", texte: "Trois machines virtuelles sous VMware sur un réseau isolé 192.168.10.0/24 : SRV-CPD (contrôleur de domaine principal, DNS, DHCP, partages), SRV-CSD (contrôleur de domaine secondaire, DNS) et PC-01 (poste Windows 10 Pro du salarié)." },
      { titre: "Démarche", liste: [
        "Réseau : adresses IP fixes et nommage des serveurs",
        "Domaine : rôle AD DS et DNS, nouvelle forêt novaconseil.local",
        "DHCP : étendue de .100 à .150, autorisée dans l'Active Directory",
        "Annuaire : une unité d'organisation et un groupe de sécurité par service, comptes créés aussi en PowerShell",
        "Partages : un partage unique, droits NTFS par groupe et énumération basée sur l'accès",
        "GPO : lecteurs réseau ciblés par groupe, fond d'écran imposé, panneau de configuration bloqué",
        "Redondance : second contrôleur de domaine et réplication vérifiée avec repadmin",
        "Tests : jonction du poste au domaine, gpresult et connexion avec le contrôleur principal éteint"
      ] },
      { titre: "Résultat", texte: "Chaque salarié se connecte avec un compte unique, retrouve automatiquement ses lecteurs réseau et ne voit que les dossiers de son service. Si SRV-CPD tombe en panne, SRV-CSD prend le relais pour les connexions." },
      { titre: "Pistes d'amélioration", liste: [
        "Serveur de fichiers dédié plutôt que sur un contrôleur de domaine",
        "Basculement DHCP entre les deux serveurs",
        "Sauvegarde de l'Active Directory",
        "Méthode AGDLP avec des groupes de domaine local"
      ] }
    ],
    outils: ["Windows Server 2022", "AD DS", "DNS", "DHCP", "GPO", "PowerShell", "Windows 10 Pro", "VMware Workstation"],
    competences: ["B1.4", "B1.5"]
  },
  {
    ref: "RP-03",
    titre: "Segmentation réseau par VLAN",
    cadre: "Formation",
    lieu: "IPSSI, Serris",
    periode: "2025 – 2026",
    resume: "Réseau d'entreprise segmenté par service, avec routage inter-VLAN et DHCP sur équipements Cisco.",
    contexte: "Séparer les flux des services Direction, Comptabilité et Production pour améliorer la sécurité.",
    missions: [
      "Plan d'adressage IP et sous-réseaux",
      "Création des VLAN et des ports trunk",
      "Routage inter-VLAN (router-on-a-stick)",
      "Serveur DHCP avec relais",
      "Maquette et tests sous Packet Tracer"
    ],
    outils: ["Cisco IOS", "Packet Tracer", "Switchs 2960", "Routeur 4321"],
    competences: ["B1.4", "B1.5"]
  },
  {
    ref: "RP-04",
    titre: "Installation de serveurs en datacenter",
    cadre: "Alternance",
    lieu: "JILITI, Rungis",
    periode: "2025 – 2026",
    resume: "Du quai de chargement jusqu'au rack : réception, contrôle, montage, câblage et mise sous tension.",
    contexte: "De nouveaux serveurs devaient être mis en place dans un datacenter. J'ai pris en charge la partie physique, de leur arrivée sur le site jusqu'à leur installation dans les baies.",
    missions: [
      "Réception des serveurs au quai de chargement et contrôle du bon de livraison",
      "Vérification de l'état du matériel et relevé des numéros de série",
      "Acheminement vers la salle serveurs en respectant les règles d'accès du site",
      "Montage des rails et installation des serveurs dans les racks",
      "Câblage électrique et réseau, puis étiquetage des câbles",
      "Mise sous tension, contrôle des voyants et mise à jour de l'inventaire"
    ],
    outils: ["Racks 19 pouces", "PDU", "RJ45 et fibre", "Étiqueteuse", "Ticketing"],
    competences: ["B1.1", "B1.5"]
  },
  {
    ref: "RP-05",
    titre: "Supervision avec Zabbix",
    cadre: "Formation",
    lieu: "IPSSI, Serris",
    periode: "2025 – 2026",
    resume: "Surveillance des serveurs et des switchs avec seuils d'alerte et notifications automatiques.",
    contexte: "Détecter les pannes avant les utilisateurs grâce à une supervision centralisée.",
    missions: [
      "Installation du serveur Zabbix sur Debian",
      "Ajout des hôtes Windows et Linux par agent",
      "Supervision SNMP des switchs",
      "Seuils d'alerte et notifications par mail",
      "Auto-formation sur la documentation officielle"
    ],
    outils: ["Zabbix", "SNMP", "Debian", "PostgreSQL"],
    competences: ["B1.1", "B1.6"]
  },
  {
    ref: "RP-06",
    titre: "Portfolio professionnel",
    cadre: "Projet personnel",
    lieu: "GitHub Pages",
    periode: "2026",
    resume: "Ce site : HTML, CSS et JavaScript sans bibliothèque, hébergé sur GitHub Pages.",
    contexte: "Présenter mon parcours et mes compétences aux jurys et aux recruteurs, avec un site simple à mettre à jour.",
    missions: [
      "Structure du site en HTML sémantique",
      "Mise en page responsive en CSS (ordinateur et mobile)",
      "Réalisations stockées dans un seul fichier JavaScript, d'où sont générés la grille et le tableau E5",
      "Versionnement avec Git et hébergement sur GitHub Pages"
    ],
    outils: ["HTML", "CSS", "JavaScript", "Git", "GitHub Pages"],
    competences: ["B1.3", "B1.6"]
  }
];
