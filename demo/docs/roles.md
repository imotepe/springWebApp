# Roles fonctionnels

| Role | Description | Actions cles |
|------|-------------|--------------|
| **SUPER_PLATFORM_ADMIN** | Super administrateur plateforme | Creer/embarquer les organisations, gerer les parametres globaux, supprimer toute organisation |
| **PLATFORM_ADMIN** | Administrateur plateforme | Meme perimetre sans droit de suppression d'organisation |
| **ORGANIZATION_ADMIN** | Administrateur d'organisation | Gere les ressources, types de rendez-vous et configurations d'une organisation donnee |
| **SERVICE_MANAGER** | Responsable operations / Service Manager | Orchestration operationnelle des ressources et de leurs disponibilites |
| **AGENT** | Agent / accueil | Creation et modification des rendez-vous, relation client ; pas d'acces aux commentaires/evenements |
| **AUDITOR** | Auditeur | Lecture seule hors commentaires/evenements sensibles |
| **PRACTITIONER** | Ressource humaine realisant les rendez-vous | Accede uniquement a ses rendez-vous et a ses propres evenements/notes |

Chaque utilisateur (`User`) possede un ensemble de `UserRole` stocke dans MongoDB. Ces roles pourront alimenter la couche de securite (Spring Security ou autre) pour appliquer les restrictions decrites.
