let { api_alimentation_intranet: { exposed_url: apiUrl } } = require('../../../env')
let fullApiUrl = `${ apiUrl.scheme }://${ apiUrl.host }:${ apiUrl.port }/${ apiUrl.path }`

module.exports = {
  v1: {
    swagger: `2.0`,
    info: {
      title: `Datalake - API intra`,
      description: `API Datalake disponible sur le RIE. Cette Api permet de gérer la synchronisation entre udata et le hub. Certaines actions nécessitent d'utiliser la clé d'api de udata.`,
      version: `1.0.0`,
      termsOfService: `${ fullApiUrl }/termsofservice`,
      contact: { name: `Assistance API`, url: `${ fullApiUrl }/support`, email: `support-datalake@developpement-durable.gouv.fr` },
      license: { name: `Ma licence`, url: `${ fullApiUrl }/license` }
    },
    host: `${ apiUrl.host }:${ apiUrl.port }`,
    basePath: `/${ apiUrl.path }`,
    schemes: [apiUrl.scheme],
    consumes: [`application/octet-stream`, `application/json`],
    produces: [`application/json`],
    tags: [
      { name: `refs`, description: `Opérations sur les référentiels utilisés par le Datalake` },
      { name: `users`, description: `Opérations concernant les utilisateurs du Datalake` },
      { name: `datasets`, description: `Opérations sur les jeux de données` },
      { name: `attachments`, description: `Opérations sur les pièces jointes appartenant à un jeu de données` },
      { name: `datafiles`, description: `Opérations sur les fichiers de données appartenant à un jeu de données` },
      { name: `files`, description: `Opérations pour le téléversement de fichier` },
      { name: `jobs`, description: `Opérations sur les tâches asynchrones d'alimentation du hub` },
      { name: `messages`, description: `Opérations sur les messages envoyés par le Datalake` }
    ],
    paths: {
      '/v1/referentiels/licenses': {
        get: {
          tags: [`refs`],
          summary: `Lister les types de licences disponibles`,
          description: `Permet d'obtenir la liste des licences autorisées dans le Datalake`,
          operationId: `list_licenses`,
          produces: [`application/json`],
          responses: {
            '200': { $ref: `#/responses/listLicensesResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/referentiels/topics': {
        get: {
          tags: [`refs`],
          summary: `Lister les thèmes disponibles`,
          description: `Permet d'obtenir la liste des thèmes autorisés dans le Datalake`,
          operationId: `list_topics`,
          produces: [`application/json`],
          responses: {
            '200': { $ref: `#/responses/listTopicsResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/referentiels/frequencies': {
        get: {
          tags: [`refs`],
          summary: `Lister les fréquences de mise-à-jour disponibles`,
          description: `Permet d'obtenir la liste des fréquences de mise-à-jour autorisées dans le Datalake`,
          operationId: `list_frequencies`,
          produces: [`application/json`],
          responses: {
            '200': { $ref: `#/responses/listFrequenciesResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/referentiels/tags': {
        get: {
          tags: [`refs`],
          summary: `Lister les mots-clé disponibles`,
          description: `Permet d'obtenir la liste des 10 premiers mot-clés autorisés dans le Datalake contenant une valeur donnée`,
          operationId: `list_tags`,
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/tagSearchTermInQuery` },
            { $ref: `#/parameters/tagSearchResultsInQuery` }
          ],
          responses: {
            '200': { $ref: `#/responses/listTagsResponse` },
            '400': { $ref: `#/responses/validationErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/referentiels/allTags': {
        get: {
          tags: [`refs`],
          summary: `Lister tous les mots-clé disponibles`,
          description: `Permet d'obtenir la liste des mot-clés autorisés dans le Datalake`,
          operationId: `list_allTags`,
          produces: [`application/json`],
          responses: {
            '200': { $ref: `#/responses/listTagsResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/referentiels/granularities': {
        get: {
          tags: [`refs`],
          summary: `Lister les granularités spatiales disponibles`,
          description: `Permet d'obtenir la liste des granularités spatiales autorisées dans le datalake`,
          operationId: `list_granularities`,
          produces: [`application/json`],
          responses: {
            '200': { $ref: `#/responses/listGranularitiesResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/referentiels/zones': {
        get: {
          tags: [`refs`],
          summary: `Lister les zones geohisto disponibles`,
          description: `Permet d'obtenir la liste des 10 premiers zones geohisto suggérée à partir d'une une valeur donnée`,
          operationId: `list_zones`,
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/zoneSearchTermInQuery` }
          ],
          responses: {
            '200': { $ref: `#/responses/listZonesResponse` },
            '400': { $ref: `#/responses/validationErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/referentiels/zones/{id}': {
        get: {
          tags: [`refs`],
          summary: `Récupérer une zone`,
          description: `Permet d'obtenir une zone geohisto par son id`,
          operationId: `get_zone`,
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/zoneIdInPath` }
          ],
          responses: {
            '200': { $ref: `#/responses/zoneResponse` },
            '400': { $ref: `#/responses/validationErrorResponse` },
            '404': { $ref: `#/responses/notFoundErrorResponse` },
            default: { $ref: `#/responses/serverError` }
          }
        }
      },
      '/v1/referentiels/organizations': {
        get: {
          tags: [`refs`],
          summary: `Lister les organisations dans le Datalake`,
          description: `Permet d'obtenir la liste des organisations créées dans le Datalake`,
          operationId: `list_organizations`,
          produces: [`application/json`],
          responses: {
            '200': { $ref: `#/responses/listOrganizationsResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/referentiels/nomenclatures': {
        get: {
          tags: [`refs`],
          summary: `Lister les nomenclatures disponibles `,
          description: `Permet d'obtenir la liste des nomenclatures dans le Datalake`,
          operationId: `list_nomenclatures`,
          produces: [`application/json`],
          responses: {
            '200': { $ref: `#/responses/listnomenclaturesResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/auth': {
        post: {
          tags: [`users`],
          summary: `Authentification par saisie d'identifiants`,
          description: `Permet de s'authentifier sur le Datalake en saisissant ses identifiants`,
          operationId: `authenticate`,
          consumes: [`application/json`],
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/credentialsInBody` }
          ],
          responses: {
            '200': { $ref: `#/responses/meResponse` },
            '400': { $ref: `#/responses/validationErrorResponse` },
            '404': { $ref: `#/responses/notFoundErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/users/me': {
        get: {
          tags: [`users`],
          summary: `Récupère l'utilisateur possédant l'apiKey`,
          description: `Permet d'obtenir l'utilisateur possédant une clé d'api`,
          operationId: `get_user`,
          produces: [`application/json`],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/meResponse` },
            '401': { $ref: `#/responses/unauthorizedErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/users/me/infos': {
        get: {
          tags: [`users`],
          summary: `Récupère les infos de l'utilsiateur de la clé d'api`,
          description: `Permet d'obtenir les infos de utilisateur possédant une clé d'api`,
          operationId: `get_user_infos`,
          produces: [`application/json`],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/myInfosResponse` },
            '401': { $ref: `#/responses/unauthorizedErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/files': {
        get: {
          tags: [`files`],
          summary: `Lister les fichiers téléversés d'un utilisateur`,
          description: `Permet de récupérer les liste des fichiers d'un utilisateur identifié par sa cle d'api`,
          operationId: `list_files`,
          produces: [`application/json`],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/listUploadeFilesResponse` },
            '400': { $ref: `#/responses/validationErrorResponse` },
            '401': { $ref: `#/responses/unauthorizedErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        },
        post: {
          tags: [`files`],
          summary: `Téléverser un fichier`,
          description: `Permet de téléverser un fichier et de récupérer un jeton d'identification du fichier sur le serveur`,
          operationId: `upload_file`,
          consumes: [`multipart/form-data`],
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/uploadedFileNameInHeader` },
            { $ref: `#/parameters/uploadedFileContentInBody` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '201': { $ref: `#/responses/tokenFileResponse` },
            '400': { $ref: `#/responses/validationErrorResponse` },
            '401': { $ref: `#/responses/unauthorizedErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/files/{tokenFile}': {
        get: {
          tags: [`files`],
          summary: `Récupérer les infos d'un fichier téléversé`,
          description: `Permet de récupérer les infos d'un fichier téléversé sur le serveur identifié par son token`,
          operationId: `get_file`,
          parameters: [
            { $ref: `#/parameters/tokenFileInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/uploadedFileResponse` },
            '400': { $ref: `#/responses/validationErrorResponse` },
            '401': { $ref: `#/responses/unauthorizedErrorResponse` },
            '403': { $ref: `#/responses/forbiddenErrorResponse` },
            '404': { $ref: `#/responses/notFoundErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        },
        delete: {
          tags: [`files`],
          summary: `Supprimer un fichier téléversé`,
          description: `Permet de supprimer un fichier téléversé sur le serveur`,
          operationId: `delete_file`,
          parameters: [
            { $ref: `#/parameters/tokenFileInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '204' : { $ref: `#/responses/deletedResponse` },
            '400': { $ref: `#/responses/validationErrorResponse` },
            '401': { $ref: `#/responses/unauthorizedErrorResponse` },
            '403': { $ref: `#/responses/forbiddenErrorResponse` },
            '404': {$ref: `#/responses/notFoundErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/files/{tokenFile}/checkcsv': {
        get: {
          tags: [`files`],
          summary: `Tester un fichier csv augmenté déjà téléversé`,
          description: `Permet de tester la validité d'un fichier csv augmenté déjà téléversé. Le fichier est identifié par son jeton. Le résultat peut contenir des messages de type 'erreur ou 'alerte'`,
          operationId: `check_csv_file`,
          produces: [`application/json`],
          parameters: [
            {$ref: `#/parameters/tokenFileInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/resultCheckCsvResponse` },
            '400': { $ref: `#/responses/validationErrorResponse` },
            '401': { $ref: `#/responses/unauthorizedErrorResponse` },
            '403': { $ref: `#/responses/forbiddenErrorResponse` },
            '404': {$ref: `#/responses/notFoundErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/messages': {
        get: {
          tags: [`messages`],
          summary: `Récupérer les messages appartenant à un utilisateur`,
          description: `Permet d'obtenir la liste des messages envoyés par le Datalake à un utilisateur identifié par sa clé d'api`,
          operationId: `get_user_messages`,
          produces: [`application/json`],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/listMessagesResponse` },
            '400': { $ref: `#/responses/validationErrorResponse` },
            '401': { $ref: `#/responses/unauthorizedErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/messages/{id}': {
        get: {
          tags: [`messages`],
          summary: `Récupérer un message`,
          description: `Permet d'obtenir un message par son id`,
          operationId: `get_message`,
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/messageIdInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/messageResponse` },
            '400': { $ref: `#/responses/validationErrorResponse` },
            '401': { $ref: `#/responses/unauthorizedErrorResponse` },
            '403': { $ref: `#/responses/forbiddenErrorResponse` },
            '404': { $ref: `#/responses/notFoundErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        },
        put: {
          tags: [`messages`],
          summary: `Modifier le message`,
          description: `Permet de marqué un message idenfié par son id comme lu ou non lu`,
          operationId: `edit_message`,
          consumes: [`application/json`],
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/messageIdInPath` },
            { $ref: `#/parameters/messageInBody` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/messageResponse` },
            '400': { $ref: `#/responses/validationErrorResponse` },
            '401': { $ref: `#/responses/unauthorizedErrorResponse` },
            '403': { $ref: `#/responses/forbiddenErrorResponse` },
            '404': { $ref: `#/responses/notFoundErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        },
        delete: {
          tags: [`messages`],
          summary: `Supprimer un message`,
          description: `Permet de supprimer un message identifié par son id`,
          operationId: `delete_message`,
          parameters: [
            { $ref: `#/parameters/messageIdInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '204': { $ref: `#/responses/deletedResponse` },
            '400': { $ref: `#/responses/validationErrorResponse` },
            '401': { $ref: `#/responses/unauthorizedErrorResponse` },
            '403': { $ref: `#/responses/forbiddenErrorResponse` },
            '404': { $ref: `#/responses/notFoundErrorResponse` },
            default: { $ref: `#/responses/serverErrorResponse` }
          }
        }
      },
      '/v1/datasets': {
        get: {
          tags: [`datasets`],
          summary: `Lister les jeux de données appartenant à mon organisation`,
          description: `Permet d'obtenir la liste des jeux de données sur lesquels un utilisateur authentifié par sa clé d'api peut agir`,
          operationId: `list_datasets`,
          produces: [`application/json`],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/listDatasetsResponse` },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        },
        post: {
          tags: [`datasets`],
          summary: `Créer un nouveau jeu de données`,
          description: `Permet de créer un nouveau jeu de données dans une des organisations dont on est membre`,
          operationId: `create_dataset`,
          consumes: [`application/json`],
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetInBody` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '201': { $ref: `#/responses/datasetResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/datasets/alerts': {
        get: {
          tags: [`datasets`],
          summary: `Lister les jeux de données appartenant à mon organisation et qui doivent être mis-à-jour prochainement`,
          description: `Permet d'obtenir la liste des jeux de données sur lesquels un utilisateur authentifié par sa clé d'api peut agir et qui doivent être mis-à-jour prochainement`,
          operationId: `list_datasets_alerts`,
          produces: [`application/json`],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/listDatasetsResponse` },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/datasets/{id}': {
        get: {
          tags: [`datasets`],
          summary: `Récupérer un jeu de données`,
          description: `Permet d'obtenir un jeu de données dont on connaît l'id`,
          operationId: `get_dataset`,
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/datasetResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        },
        put: {
          tags: [`datasets`],
          summary: `Modifier les métadonnées d'un jeu de données`,
          description: `Permet de modifier les métadonnées d'un jeu de données dont on connaît l'id`,
          operationId: `update_dataset`,
          consumes: [`application/json`],
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/datasetInBody` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/datasetResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        },
        delete: {
          tags: [`datasets`],
          summary: `Supprimer un jeu de données`,
          description: `Permet de supprimer un jeu de données dont on connaît l'id`,
          operationId: `delete_dataset`,
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '204': { $ref: `#/responses/deletedResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/datasets/{id}/logs': {
        get: {
          tags: [`datasets`],
          summary: `Récupérer l'historique des modifications d'un jeu de données`,
          description: `Permet d'obtenir l'historique des modification d'un jeu de données dont on connaît l'id`,
          operationId: `get_dataset_logs`,
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/listLogsResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/datasets/{id}/attachments': {
        get: {
          tags: [`attachments`],
          summary: `Récupérer les fichiers descriptifs d'un jeu de données`,
          description: `Permet d'obtenir la liste des fichiers descriptifs d'un jeu de données dont on connaît l'id`,
          operationId: `get_dataset_attachments`,
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/listAttachmentsResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        },
        post: {
          tags: [`attachments`],
          summary: `Créer un nouveau fichier descriptif`,
          description: `Permet de créer un nouveau fichier descriptif pour un jeu de données dont on connaît l'id`,
          operationId: `create_attachment`,
          consumes: [`application/json`],
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/newAttachmentInBody` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '201': { $ref: `#/responses/attachmentResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/datasets/{id}/attachments/{rid}': {
        get: {
          tags: [`attachments`],
          summary: `Récupérer un fichier descriptif`,
          description: `Permet d'obtenir un fichier descriptif par son rid et l'id de son jeu de données`,
          operationId: `get_attachment`,
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/attachmentRidInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/attachmentResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        },
        delete: {
          tags: [`attachments`],
          summary: `Supprimer un fichier descriptif`,
          description: `Permet de supprimer un fichier descriptif par son rid et l'id de son jeu de données`,
          operationId: `delete_attachment`,
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/attachmentRidInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '204': { $ref: `#/responses/deletedResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/datasets/{id}/attachments/{rid}/logs': {
        get: {
          tags: [`attachments`],
          summary: `Récupérer l'historique des modifications d'un fichier descriptif`,
          description: `Permet d'obtenir l'historique des modification d'un fichier descriptif par son rid et l'id de son jeu de données`,
          operationId: `get_attachment_logs`,
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/attachmentRidInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/listLogsResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/datasets/{id}/attachments/{rid}/metadata': {
        put: {
          tags: [`attachments`],
          summary: `Modifier les métadonnées d'un fichier descriptif`,
          description: `Permet de modifier les métadonnées d'un fichier descriptif par son rid et l'id de son jeu de données`,
          operationId: `update_attachment_metadata`,
          consumes: [`application/json`],
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/attachmentRidInPath` },
            { $ref: `#/parameters/attachmentMetadataInBody` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/attachmentResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/datasets/{id}/attachments/{rid}/file': {
        put: {
          tags: [`attachments`],
          summary: `Remplacer un fichier descriptif`,
          description: `Permet de remplacer un fichier descriptif par son rid et l'id de son jeu de données`,
          operationId: `update_attachment_file`,
          consumes: [`application/json`],
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/attachmentRidInPath` },
            { $ref: `#/parameters/tokenFileInBody` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/attachmentResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/datasets/{id}/datafiles': {
        get: {
          tags: [`datafiles`],
          summary: `Récupérer les fichiers de données d'un jeu de données`,
          description: `Permet d'obtenir la liste des fichiers de données d'un jeu de données dont on connaît l'id`,
          operationId: `get_dataset_datafiles`,
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/listDatafilesResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        },
        post: {
          tags: [`datafiles`],
          summary: `Créer un nouveau fichier de données`,
          description: `Permet de créer un nouveau fichier de données pour un jeu de données dont on connaît l'id`,
          operationId: `create_datafile`,
          consumes: [`application/json`],
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/newDatafileInBody` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '202': { $ref: `#/responses/datafileJobResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            '409': { $ref: '#/responses/businessRulesErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/datasets/{id}/datafiles/{rid}': {
        get: {
          tags: [`datafiles`],
          summary: `Récupérer un fichier de données`,
          description: `Permet d'obtenir un fichier de données par son rid et l'id de son jeu de données`,
          operationId: `get_datafile`,
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/datafileRidInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/datafileResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        },
        post: {
          tags: [`datafiles`],
          summary: `Ajouter un millésime au fichier de données`,
          description: `Permet d'ajouter un nouveau millésime à un fichier de données identifié par son rid et l'id de son jeu de données`,
          operationId: `add_datafile_millesime`,
          consumes: [`application/json`],
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/datafileRidInPath` },
            { $ref: `#/parameters/tokenFileAndMillesimeDateInBody` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '202': { $ref: `#/responses/datafileJobResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            '409': { $ref: '#/responses/businessRulesErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        },
        delete: {
          tags: [`datafiles`],
          summary: `Supprimer un fichier de données`,
          description: `Permet de supprimer un fichier de données par son rid et l'id de son jeu de données`,
          operationId: `delete_datafile`,
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/datafileRidInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '204': { $ref: `#/responses/deletedResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/datasets/{id}/datafiles/{rid}/logs': {
        get: {
          tags: [`datafiles`],
          summary: `Récupérer l'historique des modifications d'un fichier de données`,
          description: `Permet d'obtenir l'historique des modification d'un fichier de données par son rid et l'id de son jeu de données`,
          operationId: `get_datafile_logs`,
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/datafileRidInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/listLogsResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/datasets/{id}/datafiles/{rid}/metadata': {
        put: {
          tags: [`datafiles`],
          summary: `Modifier les métadonnées d'un fichier de données`,
          description: `Permet de modifier les métadonnées d'un fichier de données par son rid et l'id de son jeu de données`,
          operationId: `update_datafile_metadata`,
          consumes: [`application/json`],
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/datafileRidInPath` },
            { $ref: `#/parameters/datafileMetadataInBody` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/datafileResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/datasets/{id}/datafiles/{rid}/millesimes/{millesime}': {
        put: {
          tags: [`datafiles`],
          summary: `Remplacer le millésime d'un fichier de données`,
          description: `Permet de remplacer le millésime d'un fichier de données identifié par son rid et l'id de son jeu de données`,
          operationId: `replace_datafile_millesime`,
          consumes: [`application/json`],
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/datafileRidInPath` },
            { $ref: `#/parameters/datafileMillesimeInPath` },
            { $ref: `#/parameters/tokenFileInBody` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '202': { $ref: `#/responses/datafileJobResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            '409': { $ref: '#/responses/businessRulesErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        },
        delete: {
          tags: [`datafiles`],
          summary: `Supprimer un millésime d'un fichier de données`,
          description: `Permet de supprimer un millésime d'un fichier de données identifié par son rid et l'id de son jeu de données`,
          operationId: `delete_datafile_millesime`,
          parameters: [
            { $ref: `#/parameters/datasetIdInPath` },
            { $ref: `#/parameters/datafileRidInPath` },
            { $ref: `#/parameters/datafileMillesimeInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '204': { $ref: `#/responses/deletedResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            '409': { $ref: '#/responses/businessRulesErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/jobs': {
        get: {
          tags: [`jobs`],
          summary: `Récupérer les tâches appartenant à un utilisateur`,
          description: `Permet d'obtenir la liste des tâches relatives à un utilisateur identifié par sa clé d'api`,
          operationId: `get_user_jobs`,
          produces: [`application/json`],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/listDatafileJobsResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      },
      '/v1/jobs/{id}': {
        get: {
          tags: [`jobs`],
          summary: `Récupérer une tâche`,
          description: `Permet d'obtenir une tâche par son id`,
          operationId: `get_job`,
          produces: [`application/json`],
          parameters: [
            { $ref: `#/parameters/jobIdInPath` }
          ],
          security: [
            { apiKeyInHeader: [] }
          ],
          responses: {
            '200': { $ref: `#/responses/datafileJobResponse` },
            '400': { $ref: '#/responses/validationErrorResponse' },
            '401': { $ref: '#/responses/unauthorizedErrorResponse' },
            '403': { $ref: '#/responses/forbiddenErrorResponse' },
            '404': { $ref: '#/responses/notFoundErrorResponse' },
            default: { $ref: '#/responses/serverErrorResponse' }
          }
        }
      }
    },
    definitions: {
      ListLicenses: {
        type: `array`,
        description: `Liste de licenses`,
        items: { $ref: `#/definitions/License` }
      },
      License: {
        type: `object`,
        description: `une licence`,
        required: [`id`, `name`, `description`],
        properties: {
          id: {
            description: `Identifiant udata de la licence`,
            type: `string`,
            example: `ODbL-1.0`
          },
          name: {
            description: `Nom de la licence`,
            type: `string`,
            example: `ODC Open Database License, millesime 1.0`
          },
          description: {
            description: `Description de la licence`,
            type: `string`,
            format: `ObjectId`,
            example: `description de la licence`
          }
        }
      },
      ListTopics: {
        type: `array`,
        description: `Liste de thèmes`,
        items: { $ref: `#/definitions/Topic` }
      },
      Topic: {
        type: `string`,
        description: `un thème`,
        example: `Transport`
      },
      ListFrequencies: {
        type: `array`,
        description: `Liste de fréquences de mise-à-jour`,
        items: { $ref: `#/definitions/Frequency` }
      },
      Frequency: {
        type: `object`,
        description: `une fréquence de mise-àjour`,
        required: [`id`, `label`],
        properties: {
          id: {
            description: `Identifiant udata de la fréquence de mise-à-jour`,
            type: `string`,
            example: `annual`
          },
          label: {
            description: `Nom en français de la fréquence de mise-à-jour`,
            type: `string`,
            example: `Annuelle`
          }
        }
      },
      ListTags: {
        type: `array`,
        description: `Liste de mots-clé`,
        items: { $ref: `#/definitions/Tag` }
      },
      Tag: {
        type: `object`,
        description: `un mot-clé`,
        required: [`value`, `display`, `topic`, `eurovoc`, `ecoplanet`],
        properties: {
          value: {
            description: `Valeur de stockage dans udata du mot-clé`,
            type: `string`,
            example: `espace-urbain`
          },
          display: {
            description: `Valeur d'affichage du mot-clé`,
            type: `string`,
            example: `espace urbain`
          },
          topic: {
            description: `Thèmes auxquels appartient le mot-clé`,
            type: `array`,
            items: {
              type: `string`,
              description: `un thème`,
              example: `Environnement`
            }
          },
          eurovoc: {
            description: `Correspondance eurovoc du mot-clé (peut-être vide)`,
            type: `string`,
            example: ``
          },
          ecoplanet: {
            description: `Correspondance ecoplanet du mot-clé (peut-être vide)`,
            type: `string`,
            example: ``
          }
        }
      },
      ListGranularities: {
        type: `array`,
        description: `Liste de granularités spatiales`,
        items: { $ref: `#/definitions/Granularity` }
      },
      Granularity: {
        type: `object`,
        description: `une granularité spatiale`,
        required: [`id`, `label`],
        properties: {
          id: {
            description: `Identifiant udata de la granularité spatiale`,
            type: `string`,
            example: `fr:commune`
          },
          label: {
            description: `Nom en français de la granularité spatiale`,
            type: `string`,
            example: `Commune`
          }
        }
      },
      ListZones: {
        type: `array`,
        description: `Liste de zones`,
        items: { $ref: `#/definitions/Zone` }
      },
      Zone: {
        type: `object`,
        description: `une zone`,
        required: [`id`, `name`, `level`, `code`, `validity`],
        properties: {
          id: {
            description: `Identifiant geohisto de la zone`,
            type: `string`,
            example: `fr:departement:63@1860-07-01`
          },
          name: {
            description: `Nom de la zone`,
            type: `string`,
            example: `Puy-de-Dôme`
          },
          level: {
            description: `niveau géographique de la zone`,
            type: `string`,
            example: `fr:departement`
          },
          code: {
            description: `code géographique de la zone`,
            type: `string`,
            example: 63
          },
          validity: {
            type: `object`,
            description: `validité temporelle de la zone`,
            properties: {
              start: {
                description: `Date de début de validité - format iso 8601`,
                type: `string`,
                format: `date-time`,
                example: `1860-07-01T00:00:00.000Z`
              },
              end: {
                description: `Date de fin de validité - format iso 8601`,
                type: `string`,
                format: `date-time`,
                example: `9999-12-31T00:00:00.000Z`
              }
            }
          }
        }
      },
      ListOrganizations: {
        type: `array`,
        description: `Liste d'organisations'`,
        items: { $ref: `#/definitions/Organization` }
      },
      Organization: {
        type: `object`,
        description: `une organisation`,
        required: [`id`, `title`, `acronym`, `description`, `members`],
        properties: {
          id: {
            description: `Identifiant de l'organisation`,
            type: `string`,
            format: `ObjectId`,
            example: `5a27d86005e27526c52d395e`
          },
          title: {
            description: `Nom de l'organisation`,
            type: `string`,
            example: `Bureau de l'assistance à maîtrise d'ouvrage des systèmes d'information`
          },
          acronym: {
            description: `Acronyme de l'organisation`,
            type: `string`,
            example: `CGDD/SDES/SDVSB/BSI`
          },
          description: {
            description: `Description de l'organisation`,
            type: `string`,
            example: `Cette organisation est responsable de.....`
          },
          members: {
            type: `array`,
            description: `Liste des membres de l'organisation`,
            items: { $ref: `#/definitions/Member` }
          }
        }
      },
      ListNomenclatures: {
        type: `array`,
        description: `Liste des nomenclatures`,
        items: { $ref: `#/definitions/nomenclatures` }
      },
      BilanEnergie: {
        type: `object`,
        description: `nomenclature BilanEnergie`,
        required: [`code`, `name`, `unit`, `level`, `data_type`, `flow_type`],
        properties: {
          code: {
            description: `Identifiant de la nomenclature`,
            type: `string`,
            example: `BE001`
          },
          name: {
            description: `Nom du bilan d'energie`,
            type: `string`,
            example: `Production de pétrole brut`
          },
          unit: {
            description: `unit du bilan d'energie`,
            type: `string`,
            example: `Mtep`
          },
          level: {
            description: `Emplacement du bilan d'energie`,
            type: `string`,
            example: `Métropole`
          },
          flow_type: {
            description: '',
            type: `string`,
            example: `Production primaire`
          }
        }
      },
      Csl_filiere: {
        type: `object`,
        description: `nomenclature csl_filiere`,
        required: [`code`, `name`],
        properties: {
          code: {
            description: `Identifiant de la nomenclature`,
            type: `string`,
            example: `FLT`
          },
          name: {
            description: `Nom du csl_filiere`,
            type: `string`,
            example: `Ensemble des filières`
          }
        }
      },
      Csl_operation: {
        type: `object`,
        description: `nomenclature csl_operation`,
        required: [`code_1`, `name_1`, `code_2`, `name_2`, `code_3`, `name_3`, `code_4`, `name_4`,],
        properties: {
          code_1: {
            description: `Identifiant 1 de la nomenclature`,
            type: `string`,
            example: `OE`
          },
          name_1: {
            description: `Nom 1 du csl_operation`,
            type: `string`,
            example: `Dépenses des occupants`
          },
          code_2: {
            description: `Identifiant 2 de la nomenclature`,
            type: `string`,
            example: `OEO1`
          },
          name_2: {
            description: `Nom 2 du csl_operation`,
            type: `string`,
            example: `Loyers (ou redevances) payé par les occupants`
          },
          code_3: {
            description: `Identifiant 3 de la nomenclature`,
            type: `string`,
            example: `OEO1`
          },
          name_3: {
            description: `Nom 3 du csl_operation`,
            type: `string`,
            example: `Loyers (ou redevances) payé par les occupants`
          },
          code_4: {
            description: `Identifiant 4 de la nomenclature`,
            type: `string`,
            example: `OEO111`
          },
          name_4: {
            description: `Nom 4 du csl_operation`,
            type: `string`,
            example: `Loyers réels`
          }
        }
      },
      nomenclatures:{
        type: `object`,
        description: `La liste des nomenclatures`,
        required: [`bilan_Energie`],
        properties: {
          bilan_Energie: {
            type: `array`,
            description: `Nomenclature bilan d'energie`,
            items: { $ref: `#/definitions/BilanEnergie` }
          },
          csl_filiere: {
            type: `array`,
            description: `Nomenclature csl_filiere`,
            items: { $ref: `#/definitions/Csl_filiere` }
          },
          csl_operation: {
            type: `array`,
            description: `Nomenclature csl_operation`,
            items: { $ref: `#/definitions/Csl_operation` }
          },
        }
      },
      Member: {
        type: `object`,
        description: `un membre d'organisation`,
        required: [`id`, `first_name`, `last_name`],
        properties: {
          id: {
            description: `Identifiant du membre`,
            type: `string`,
            format: `ObjectId`,
            example: `5a27d86005e27526c52d395e`
          },
          first_name: {
            description: `Prénom de l'utilisateur`,
            type: `string`,
            example: `John`
          },
          last_name: {
            description: `Nom de l'utilisateur`,
            type: `string`,
            example: `Doe`
          }
        }
      },
      Me: {
        type: `object`,
        description: `un utilisateur`,
        required: [`id`, `active`, `email`, `first_name`, `last_name`, `organizations`, `since`, `apiKey`],
        properties: {
          id: {
            description: `Identifiant de l'utilisateur`,
            type: `string`,
            format: `ObjectId`,
            example: `5a27d86005e27526c52d395e`
          },
          active: {
            description: `L'utilisateur est-il actif ?`,
            type: `boolean`,
            example: true
          },
          email: {
            description: `Adresse électronique de l'utilisateur`,
            type: `string`,
            example: `john.doe@developpement-durable.gouv.fr`
          },
          first_name: {
            description: `Prénom de l'utilisateur`,
            type: `string`,
            example: `John`
          },
          last_name: {
            description: `Nom de l'utilisateur`,
            type: `string`,
            example: `Doe`
          },
          organizations: {
            description: `Organisations dont est membre l'utilisateur`,
            type: `array`,
            items: {
              type: `object`,
              description: `une organisation`,
              required: [`id`, `title`, `acronym`],
              properties: {
                id: {
                  description: `Identifiant de l'organisation`,
                  type: `string`,
                  format: `ObjectId`,
                  example: `5a27d86005e27526c52d395e`
                },
                title: {
                  description: `Nom de l'organisation`,
                  type: `string`,
                  example: `Bureau de l'assistance à maîtrise d'ouvrage des systèmes d'information`
                },
                acronym: {
                  description: `Acronyme de l'organisation`,
                  type: `string`,
                  example: `CGDD/SDES/SDVSB/BSI`
                }
              }
            }
          },
          since: {
            description: `Date d'enregistrement de l'utilisateur`,
            type: `string`,
            format: `date-time`,
            example: `2018-01-26T21:06:55.277Z`
          },
          apiKey: {
            description: `Clé d'api de l'utilisateur`,
            type: `string`,
            example: `eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiNWEyN2RhMzMwNWUyNzUyNzgyNDIzMTk2IiwidGltZSI6MTUxMjY4MDQ5My45MDE0Nzh9.2Hw073qkNvsZQhZlOa0YdPm_S80jJJB9doaMOs393Rk`
          }
        }
      },
      MyInfos: {
        type: `object`,
        description: `les infos d'un utilisateur`,
        required: [`datasets`, `alerts`, `jobs`, `messages`],
        properties: {
          datasets: {
            description: `Nombre de jeux de données appartenant à une des organisations de l'utilisateur`,
            type: `integer`,
            example: 10
          },
          alerts: {
            description: `Nombre de jeux de données appartenant à une des organisations de l'utilisateur et qui doivent être mis-à-jour dans moins d'une semaine`,
            type: `integer`,
            example: 2
          },
          jobs: {
            description: `Nombre de tâches appartenant à l'utilisateur`,
            type: `integer`,
            example: 8
          },
          messages: {
            description: `Nombre de messages envoyés par l'intermédiaire du Datalake à l'utilisateur`,
            type: `object`,
            required: [`read`, `unread`],
            properties: {
              read: {
                description: `Nombre de messages lus`,
                type: `integer`,
                example: 3
              },
              unread: {
                description: `Nombre de messages non lus`,
                type: `integer`,
                example: 5
              }
            }
          }
        }
      },
      TokenFile: {
        type: `object`,
        description: `un identifiant de fichier téléversé`,
        required: [`tokenFile`],
        properties: {
          tokenFile: {
            description: `Identifiant unique du fichier téléversé sur le serveur`,
            type: `string`,
            format: `uuid`,
            example: `6886999e-9b27-478b-8876-d9a4dbe57d5c`
          }
        }
      },
      ListUploadedFiles: {
        type: `array`,
        description: `Liste de fichier téléversés dans le Datalake`,
        items: { $ref: `#/definitions/UploadedFile` }
      },
      UploadedFile: {
        type: `object`,
        description: `Un fichier téléversé dans le Datalake`,
        required: [`token`, `name`, `secondsBeforeDeletion`],
        properties: {
          tokenFile: {
            description: `Identifiant unique du fichier téléversé sur le serveur`,
            type: `string`,
            format: `uuid`,
            example: `6886999e-9b27-478b-8876-d9a4dbe57d5c`
          },
          name: {
            description: `Nom du fichier téléversé sur le serveur`,
            type: `string`,
            example: `monfichier.txt`
          },
          secondsBeforeDeletion: {
            description: `Nombre de secondes avant que le fichier ne soit effacé du serveur`,
            type: `integer`,
            example: 567
          }
        }
      },
      ResultCheckCsv: {
        type: `object`,
        description: `Le résultat d'une validation d'un fichier csv`,
        required: [`result`,`message`],
        properties: {
          result: {
            description: `Le résultat de la validation qui eput être égale à valid, warning ou invalid`,
            type: `string`,
            enum: [`valid`, `warning`, `invalid`],
            example: `invalid`
          },
          message: {
            description: `Un message`,
            type: `string`,
            example: `Le fichier est invalide`
          },
          errors: {
            description: `la liste des erreurs ou des alertes`,
            type: `object`,
            properties: {
              colonne_15: {
                description: `Les erreurs de la colonne 15`,
                type: `array`,
                items: {
                  type: `object`,
                  description: `une erreur ou une alerte`,
                  required: [`type`, `message`],
                  properties: {
                    type: {
                      description: `Type: erreur ou alerte`,
                      type: `string`,
                      enum: [`error`, `warning`],
                      example: `warning`
                    },
                    message: {
                      description: `Le message de l'alerte ou de l'erreur`,
                      type: `string`,
                      example: `Le type n'est pas un type connu, le valeurs seront intégrées comme des chaînes de caractères`
                    }
                  }
                }
              }
            }
          }
        }
      },
      ListMessages: {
        type: `array`,
        description: `Liste de messages envoyés par le Datalake`,
        items: { $ref: `#/definitions/Message` }
      },
      Message: {
        type: `object`,
        description: `Un message envoyé par le Datalake`,
        required: [`id`, `owner`, `sender`, `to`, `timestamp`, `subject`, `text`, `read`],
        properties: {
          id: {
            description: `Identifiant du message`,
            type: `string`,
            format: `ObjectId`,
            example: `5a6b984705e2750395113d61`
          },
          owner: {
            description: `Identifiant du propritéaire du message`,
            type: `string`,
            format: `ObjectId`,
            example: `5a6b984705e2750395113d63`
          },
          sender: {
            description: `Utilisateur ayant envoyé le message`,
            type: `object`,
            $ref: `#/definitions/MessageUser`
          },
          to: {
            type: `array`,
            description: `Liste des destinataires principaux du message`,
            items: { $ref: `#/definitions/MessageUser` }
          },
          cc: {
            type: `array`,
            description: `Liste des destinataires en copie du message`,
            items: { $ref: `#/definitions/MessageUser` }
          },
          timestamp: {
            description: `Date du message - format iso 8601`,
            type: `string`,
            format: `date-time`,
            example: `2019-01-14T16:25:06.527Z`
          },
          subject: {
            description: `Sujet du message`,
            type: `string`,
            example: `Votre fichier a bien été intégré`
          },
          text: {
            description: `texte du message`,
            type: `string`,
            example: `Un texte.....`
          },
          textHtml: {
            description: `texte du message en Html`,
            type: `string`,
            example: `<div>Un texte.....</div>`
          },
          read: {
            description: `le message a-t-il été lu ?`,
            type: `boolean`,
            example: true
          }
        }
      },
      MessageUser: {
        type: `object`,
        description: `Un utilisateur pour un objet message`,
        required: [`isRobot`, `isUser`, `isIntranetUser`, `isDatalakeUser`],
        properties: {
          isRobot: {
            description: `cet utilisateur est-il un robot ?`,
            type: `boolean`,
            example: true
          },
          isUser: {
            description: `cet utilisateur est-il un humain ?`,
            type: `boolean`,
            example: false
          },
          isIntranetUser: {
            description: `cet utilisateur est-il un utilisateur sur intranet ?`,
            type: `boolean`,
            example: false
          },
          isDatalakeUser: {
            description: `cet utilisateur est-il un utilisateur du Datalake ?`,
            type: `boolean`,
            example: false
          },
          robot: {
            type: `object`,
            description: `Détail du robot dans le cas d'un robot`,
            required: [`name`],
            properties: {
              name: {
                description: `nom du robot`,
                type: `string`,
                example: `Robot tâche d'intégration`
              }
            }
          },
          user: {
            type: `object`,
            description: `Détail de l'utilisateur dans le cas d'un utilisateur`,
            required: [`email`, `name`],
            properties: {
              id: {
                description: `identifiant de l'utilisateur dans le cas d'un utilisateur du Datalake`,
                type: `string`,
                format: `ObjectId`,
                example: `5a6b984705e2750395113d61`
              },
              name: {
                description: `nom de l'utilisateur`,
                type: `string`,
                example: `John Doe`
              },
              email: {
                description: `email de l'utilisateur`,
                type: `string`,
                example: `john.doe@datalake.is.great.com`
              }
            }
          }
        }
      },
      ListDatasets: {
        type: `array`,
        description: `Liste de jeux de données`,
        items: { $ref: `#/definitions/Dataset` }
      },
      Dataset: {
        type: `object`,
        description: `un jeu de données`,
        required: [`id`, `title`, `description`, `organization`, `topic`, `license`, `frequency`, `created_at`],
        properties: {
          id: {
            description: `Identifiant du jeu de données`,
            type: `string`,
            format: `ObjectId`,
            example: `5a6b984705e2750395113d61`
          },
          title: {
            description: `Titre du jeu de données`,
            type: `string`,
            example: `Le titre de mon jeu de données`
          },
          description: {
            description: `Description du jeu de données`,
            type: `string`,
            example: `Une description qui peut être plus ou moins longue`
          },
          organization: {
            type: `object`,
            description: `informations sur l'organisation auquel appartient le jeu de données`,
            required: ['id', 'title'],
            properties: {
              id: {
                description: `Identifiant de l'organisation`,
                type: `string`,
                format: `ObjectId`,
                example: `5a27d86005e27526c52d395e`
              },
              title: {
                description: `Nom de l'organisation`,
                type: `string`,
                example: `Bureau de l'assistance à maîtrise d'ouvrage des systèmes d'information`
              },
            }
          },
          topic: {
            description: `Thème du jeu de données (liste limitée)`,
            type: `string`,
            example: `Environnement`
          },
          tags: {
            type: `array`,
            description: `Liste des mot-clés du jeu de données (liste limitée aux valeurs de stcokage des mot-clés dans udata)`,
            items: {
              type: `string`,
              description: `un mot-clé`,
              example: `agenda-21`
            }
          },
          license: {
            description: `Licence sous laquelle est publiée le jeu de données (liste limitée)`,
            type: `string`,
            example: `ODbL-1.0`
          },
          frequency: {
            description: `Fréquence d'actualisation du jeu de données (liste limitée)`,
            type: `string`,
            example: `annual`
          },
          frequency_date: {
            description: `Prochaine date d'actualisation du jeu de données (obligatoire dés que frequency n'est pas égal à unknown) - format iso 8601`,
            type: `string`,
            format: `date-time`,
            example: `2018-01-26T21:06:55.277Z`
          },
          spatial: {
            type: `object`,
            description: `Informations spatiales du jeu de données`,
            properties: {
              granularity: {
                description: `Granularité du jeu de données (liste limitée)`,
                type: `string`,
                example: `country`
              },
              zones: {
                type: `array`,
                description: `Liste de zones géographiques du jeu de données (doit correspondre à un identifiant geohisto)`,
                items: {
                  type: `string`,
                  description: `une zone géographique`,
                  example: `country:fr`
                }
              }
            }
          },
          temporal_coverage: {
            type: `object`,
            description: `Couverture temporelle du jeu de données`,
            required: [`start`, `end`],
            properties: {
              start: {
                description: `Date de début de la couverture temporelle du jeu de données - format YYYY-MM-DD`,
                type: `string`,
                example: `2017-01-01`
              },
              end: {
                description: `Date de fin de la couverture temporelle du jeu de données - format YYYY-MM-DD`,
                type: `string`,
                example: `2017-06-30`
              }
            }
          },
          caution: {
            description: `Mise en garde concernant le jeu de données`,
            type: `string`,
            example: `Ces données .....`
          },
          attachments: {
            $ref: `#/definitions/ListAttachments`
          },
          datafiles: {
            $ref: `#/definitions/ListDatafiles`
          },
          created_at: {
            description: `date de création du jeu de données - format iso 8601`,
            type: `string`,
            format: `date-time`,
            example: `2018-01-26T21:06:15.269Z`
          },
          last_modified: {
            description: `Date de dernière modification des métadonnées du jeu de données - format iso 8601`,
            type: `string`,
            format: `date-time`,
            example: `2018-01-27T02:38:37.653Z`
          },
          last_update: {
            description: `Date de dernière modification des fichiers (descriptifs ou de données) appartenant au jeu de données - format iso 8601`,
            type: `string`,
            format: `date-time`,
            example: `2018-01-27T02:38:37.653Z`
          }
        }
      },
      ListAttachments: {
        type: `array`,
        description: `Liste de fichiers descriptifs`,
        items: { $ref: `#/definitions/Attachment` }
      },
      Attachment: {
        type: `object`,
        description: `un fichier descriptif`,
        required: [`rid`, `title`, `description`, `published`, `url`, `created_at`],
        properties: {
          rid: {
            description: `Identifiant du fichier descriptif`,
            type: `string`,
            format: `uuid`,
            example: `6886999e-9b27-478b-8876-d9a4dbe57d5c`
          },
          title: {
            description: `Titre du fichier descriptif`,
            type: `string`,
            example: `Le titre de mon fichier descriptif`
          },
          description: {
            description: `Description du fichier descriptif`,
            type: `string`,
            example: `Ce fichier descriptif.......`
          },
          published: {
            description: `Date de publication du fichier descriptif - format iso 8601`,
            type: `string`,
            format: `date-time`,
            example: `2017-10-28T22:00:00.000Z`
          },
          url: {
            description: `Url pour accéder au fichier descriptif`,
            type: `string`,
            example: `http://datalake-inter.gouv.fr/files/5a6b984705e2750395113d61/6886999e-9b27-478b-8876-d9a4dbe57d5c`
          },
          created_at: {
            description: `date de création du fichier de données - format iso 8601`,
            type: `string`,
            format: `date-time`,
            example: `2018-01-26T21:58:34.190Z`
          },
          last_modified: {
            description: `Date de dernière modification du fichier de données - format iso 8601`,
            type: `string`,
            format: `date-time`,
            example: `2018-01-26T21:58:34.190Z`
          }
        }
      },
      ListDatafiles: {
        type: `array`,
        description: `Liste de fichiers de données`,
        items: { $ref: `#/definitions/Datafile` }
      },
      Datafile: {
        type: `object`,
        description: `un jeu de données`,
        required: [`rid`, `millesimes`, `title`, `description`, `published`, `url`, `created_at`, `millesimes_info`],
        properties: {
          rid: {
            description: `Identifiant du fichier de données`,
            type: `string`,
            format: `uuid`,
            example: `2f48a6cd-b147-4750-aa70-990a5c17f536`
          },
          millesimes: {
            description: `Nombre de millésimes du fichier de données`,
            type: `integer`,
            example: 2
          },
          title: {
            description: `Titre du fichier de données`,
            type: `string`,
            example: `Le titre de mon fichier de données`
          },
          description: {
            description: `Description du fichier de données`,
            type: `string`,
            example: `Ce fichier de données.......`
          },
          published: {
            description: `Date de publication du fichier de données - format iso 8601`,
            type: `string`,
            format: `date-time`,
            example: `2017-10-27T22:00:00.000Z`
          },
          temporal_coverage: {
            type: `object`,
            description: `Couverture temporelle du fichier de données`,
            required: [`start`, `end`],
            properties: {
              start: {
                description: `Date de début de la couverture temporelle du fichier de données - format YYYY-MM-DD`,
                type: `string`,
                example: `2017-01-01`
              },
              end: {
                description: `Date de fin de la couverture temporelle du fichier de données - format YYYY-MM-DD`,
                type: `string`,
                example: `2017-06-30`
              }
            }
          },
          legal_notice: {
            description: `Notice légale concernant le fichier de données`,
            type: `string`,
            example: `Ces données .....`
          },
          url: {
            description: `Url pour accéder au fichier de données`,
            type: `string`,
            example: `http://datalake-inter.gouv.fr/api/5a6b984705e2750395113d61/2f48a6cd-b147-4750-aa70-990a5c17f536`
          },
          millesimes_info: {
            description: `Informations sur les millésimes du fichier de données`,
            type: `array`,
            items: {
              type: `object`,
              description: `information sur un millésime`,
              required: [`millesime`, `rows`, `columns`],
              properties: {
                millesime: {
                  description: `Le millésime du fichier descriptif - format YYYY-MM`,
                  type: `string`,
                  format: `date-time`,
                  example: `2017-10`
                },
                rows: {
                  description: `Nombre de lignes dans le fichier de données`,
                  type: `integer`,
                  example: 2
                },
                columns: {
                  description: `Liste des colonnes du fichier de doonées`,
                  type: `array`,
                  items: {
                    type: `object`,
                    description: `Une colonne du fichier de données`,
                    required: [`name`, `description`],
                    properties: {
                      name: {
                        description: `Nom de la colonne`,
                        type: `string`,
                        example: `COLONNE_N`
                      },
                      description: {
                        description: `Description de la colonne`,
                        type: `string`,
                        example: `Description de la COLONNE_N.....`
                      }
                    }
                  }
                }
              }
            }
          },
          created_at: {
            description: `date de création du fichier de données - format iso 8601`,
            type: `string`,
            format: `date-time`,
            example: `2018-01-26T21:58:34.190Z`
          },
          last_modified: {
            description: `Date de dernière modification du fichier de données - format iso 8601`,
            type: `string`,
            format: `date-time`,
            example: `2018-01-26T21:58:34.190Z`
          }
        }
      },
      ListLogs: {
        type: `array`,
        description: `Liste des modifications dans le Datalake`,
        items: { $ref: `#/definitions/Log` }
      },
      Log: {
        type: `object`,
        description: `Historique de modification dans le Datalake`,
        required: [`id`, `type`, `user`, `dataset`, `timestamp`],
        properties: {
          id: {
            description: `Identifiant de la modification`,
            type: `string`,
            format: `ObjectId`,
            example: `5a6b984705e2750395113d61`
          },
          type: {
            description: `Type de la modification`,
            type: `string`,
            example: `create_dataset`
          },
          user: {
            description: `Utilisateur ayant réalisé la modification`,
            type: `object`,
            required: [`id`, `name`],
            properties: {
              id: {
                description: `Identifiant de l'utilisateur`,
                type: `string`,
                format: `ObjectId`,
                example: `5a6b984705e2750395113e23`
              },
              name: {
                description: `Nom de l'utilisateur`,
                type: `string`,
                example: `John Doe`
              }
            }
          },
          dataset: {
            type: `object`,
            description: `Jeu de données concerné par la modification`,
            required: [`id`, `title`],
            properties: {
              id: {
                description: `Identifiant du jeu de données`,
                type: `string`,
                format: `ObjectId`,
                example: `5a6b984705e2750395113d61`
              },
              title: {
                description: `Titre du jeu de données`,
                type: `string`,
                example: `Le titre de mon jeu de données`
              }
            }
          },
          attachment: {
            type: `object`,
            description: `Éventuel fichier descriptif concerné par la modification`,
            required: [`rid`, `title`],
            properties: {
              rid: {
                description: `Identifiant du fichier descriptif`,
                type: `string`,
                format: `uuid`,
                example: `6886999e-9b27-478b-8876-d9a4dbe57d5c`
              },
              title: {
                description: `Titre du fichier descriptif`,
                type: `string`,
                example: `Le titre de mon fichier descriptif`
              }
            }
          },
          datafile: {
            type: `object`,
            description: `Éventuel fichier de données concerné par la modification`,
            required: [`rid`, `title`, `millesime`],
            properties: {
              rid: {
                description: `Identifiant du fichier de données`,
                type: `string`,
                format: `uuid`,
                example: `2f48a6cd-b147-4750-aa70-990a5c17f536`
              },
              millesime: {
                description: `Millésime du fichier de données concerné par la modification`,
                type: `integer`,
                example: 2
              },
              title: {
                description: `Titre du fichier de données`,
                type: `string`,
                example: `Le titre de mon fichier de données`
              }
            }
          },
          timestamp: {
            description: `date de la modification - format iso 8601`,
            type: `string`,
            format: `date-time`,
            example: `2018-01-26T21:06:55.277Z`
          }
        }
      },
      ListDatafileJobs: {
        type: `array`,
        description: `Liste de tâches`,
        items: { $ref: `#/definitions/DatafileJob` }
      },
      DatafileJob: {
        type: `object`,
        required: [`id`, `owner`, `state`, `data`],
        properties: {
          id: {
            description: `Id de la tâche`,
            type: `integer`,
            example: 1
          },
          owner: {
            description: `identifiant du propriétaire de la tâche`,
            type: `string`,
            format: `ObjectId`,
            example: `5a6b984705e2750395113e23`
          },
          state: {
            description: `état en cours de la tâche`,
            type: `object`,
            required: [`status`, `created_at`],
            properties: {
              status: {
                description: `statut de la tâche`,
                type: `string`,
                enum: [`created`, `delayed`, `started`, `complete`, `failed`],
                example: `started`
              },
              created_at: {
                description: `date de création de la tâche - format iso 8601`,
                type: `string`,
                format: `date-time`,
                example: `2018-01-26T21:58:34.190Z`
              },
              promote_at: {
                description: `date de mise en file d'attente de la tâche - format iso 8601`,
                type: `string`,
                format: `date-time`,
                example: `2018-01-26T21:58:34.190Z`
              },
              started_at: {
                description: `date de démarrage de la tâche - format iso 8601`,
                type: `string`,
                format: `date-time`,
                example: `2018-01-26T21:58:34.190Z`
              },
              updated_at: {
                description: `date de dernière mise-à-jour de la tâche - format iso 8601`,
                type: `string`,
                format: `date-time`,
                example: `2018-01-26T21:58:34.190Z`
              },
              failed_at: {
                description: `date d'erreur de la tâche - format iso 8601`,
                type: `string`,
                format: `date-time`,
                example: `2018-01-26T21:58:34.190Z`
              },
              progress: {
                description: `Données d'avancement de la tâche`,
                type: `object`,
                required: [`percentage`],
                properties: {
                  percentage: {
                    description: `pourcentage d'avancement de la tâche`,
                    type: `integer`,
                    example: 48
                  },
                  step: {
                    description: `Étape d'avancement de la tâche`,
                    type: `string`,
                    example: `Traitement du fichier - (lignes traitées: 2541 / 15423 })`
                  }
                }
              }
            }
          },
          data: {
            description: `Dnnées de la tâche`,
            type: `object`,
            required: [`task`, `dataset_id`, `file_name`],
            properties: {
              task: {
                description: `type de la tâche`,
                type: `string`,
                enum: [`createDatafile`, `addDatafileMillesime`, `replaceDatafileMillesime`]
              },
              dataset_id: {
                description: `Identifiant du jeu de données concerné par la tâche`,
                type: `string`,
                format: `ObjectId`,
                example: `5a6b984705e2750395113d61`
              },
              file_name: {
                description: `Nom du fichier csv utilisé par la tâche`,
                type: `string`,
                example: `test.csv`
              },
              datafile_metadata: {
                description: `Les métadonnées du fichier de donnée (si il s'agit d'une tâche de type createDatafile)`,
                type: `object`,
                required: [`title`, `description`, `published`],
                properties: {
                  title: {
                    description: `Titre du fichier de données`,
                    type: `string`,
                    example: `Le titre de mon fichier de données`
                  },
                  description: {
                    description: `Description du fichier de données`,
                    type: `string`,
                    example: `Ce fichier de données.......`
                  },
                  published: {
                    description: `Date de publication du fichier de données - format iso 8601`,
                    type: `string`,
                    format: `date-time`,
                    example: `2017-10-28`
                  },
                  temporal_coverage_start: {
                    description: `Date de début de la couverture temporelle du fichier de données - format YYYY-MM-DD`,
                    type: `string`,
                    format: `date-time`,
                    example: `2017-01-01`
                  },
                  temporal_coverage_end: {
                    description: `Date de fin de la couverture temporelle du fichier de données - format YYYY-MM-DD`,
                    type: `string`,
                    format: `date-time`,
                    example: `2017-06-30`
                  },
                  legal_notice: {
                    description: `Notice légale concernant le fichier de données`,
                    type: `string`,
                    example: `Ces données.......`
                  }
                }
              },
              datafile_rid: {
                description: `Identifiant du fichier de données concerné par la tâche (si il s'agit d'une tâche de type addDatafileMillesime ou replaceDatafileMillesime)`,
                type: `string`,
                format: `uuid`,
                example: `2f48a6cd-b147-4750-aa70-990a5c17f536`
              },
              datafile_millesime: {
                description: `Le millésime du fichier de données concerné par la tâche (si il s'agit d'une tâche de type replaceDatafileMillesime)`,
                type: `string`,
                format: `date-time`,
                example: `2017-06`
              }
            }
          },
          result: {
            description: `Détail du résultat d'une tâche complétée`,
            type: `object`,
            required: [`rid`, `millesime`, `duration`, `csv_headers`, `columns`, `rows`],
            properties: {
              rid: {
                description: `Identifiant du fichier de données concerné par la tâche (si il s'agit d'une tâche de type addDatafileMillesime ou replaceDatafileMillesime)`,
                type: `string`,
                format: `uuid`,
                example: `2f48a6cd-b147-4750-aa70-990a5c17f536`
              },
              millesime: {
                description: `Le millésime du fichier de données`,
                type: `string`,
                format: `date-time`,
                example: `2019-06`
              },
              duration: {
                description: `Durée de la tâche en secondes`,
                type: `integer`,
                example: 480
              },
              csv_headers: {
                dsecription: `nombre d'entêtes csv du fichier`,
                type: `integer`,
                example: 5
              },
              columns: {
                dsecription: `nombre de colonnes créées`,
                type: `integer`,
                example: 8
              },
              rows: {
                dsecription: `nombre de lignes intégrées`,
                type: `integer`,
                example: 12456
              }
            }
          },
          error: {
            type: `object`,
            description: `Informations lorsque la tâche est en erreur`,
            required: [`message`],
            properties: {
              message: {
                description: `message général sur la tâche en erreur`,
                type: `string`,
                example: `tâche en erreur`
              },
              list: {
                description: `liste des erreurs`,
                type: `array`,
                items: {
                  description: `le détail d'une erreur`,
                  type: `object`,
                  required: [`line`, `column`, `message`],
                  properties: {
                    line: {
                      description: `numéro de la ligne concernée par l'erreur`,
                      type: `integer`,
                      example: 54
                    },
                    column: {
                      description: `numéro de la colonne concernée par l'erreur`,
                      type: `integer`,
                      example: 3
                    },
                    message: {
                      description: `explication de l'erreur`,
                      type: `string`,
                      example: `Format invalide pour le type mois`
                    }
                  }
                }
              }
            }
          }
        }
      },
      ValidationError: {
        description: `Le détail d'une erreur de validation au format json`,
        type: `object`,
        required: [`code`, `message`],
        properties: {
          code: {
            description: `le code HTTP de l'erreur`,
            type: `integer`,
            example: 400
          },
          message: {
            description: `le message de l'erreur`,
            type: `string`,
            example: `Erreur de validation`
          },
          errors: {
            description: `Les différentes erreurs classées par champ`,
            type: `array`,
            items: {
              type: `object`,
              properties: {
                field: {
                  description: `Le champ qui pose un problème de validation`,
                  type: `string`,
                  example: `dataset`
                },
                messages: {
                  description: `Les messages d'erreur concernant le champ`,
                  type: `array`,
                  items: {
                    type: `string`
                  }
                }
              }
            }
          }
        }
      },
      UnauthorizedError: {
        description: `Le détail d'une erreur de type authentification requise au format json`,
        type: `object`,
        required: [`code`, `message`],
        properties: {
          code: {
            description: `le code HTTP de l'erreur`,
            type: `integer`,
            example: 401
          },
          message: {
            description: `le message de l'erreur`,
            type: `string`,
            example: `Action impossible: pas d'apiKey trouvée dans l'entête HTTP 'x-api-key'`
          }
        }
      },
      ForbiddenError: {
        description: `Le détail d'une erreur de type droits insuffisants au format json`,
        type: `object`,
        required: [`code`, `message`],
        properties: {
          code: {
            description: `le code HTTP de l'erreur`,
            type: `integer`,
            example: 403
          },
          message: {
            description: `le message de l'erreur`,
            type: `string`,
            example: `Vous n'avez pas le droit d'accéder au dataset avec l'id 5c3c951785b914002287c7bd`
          }
        }
      },
      NotFoundError: {
        description: `Le détail d'une erreur de type non trouvé au format json`,
        type: `object`,
        required: [`code`, `message`],
        properties: {
          code: {
            description: `le code HTTP de l'erreur`,
            type: `integer`,
            example: 404
          },
          message: {
            description: `le message de l'erreur`,
            type: `string`,
            example: `Pas de jeu de données avec l'id 5c3c951785b914002287c7bd`
          }
        }
      },
      BusinessRulesError: {
        description: `Le détail d'une erreur métier au format json`,
        type: `object`,
        required: [`code`, `message`],
        properties: {
          code: {
            description: `le code HTTP de l'erreur`,
            type: `integer`,
            example: 409
          },
          message: {
            description: `le message de l'erreur`,
            type: `string`,
            example: `Une tâche d'ajout de fichier de données dans ce jeu de données est actuellement en cours. Vous devez attendre qu'elle se termine avant de pouvoir ajouter un nouveau fichier de données.`
          }
        }
      },
      ServerError: {
        description: `Le détail d'une erreur interne au serveur au format json`,
        type: `object`,
        required: [`code`, `message`],
        properties: {
          code: {
            description: `le code HTTP de l'erreur`,
            type: `integer`,
            example: 500
          },
          message: {
            description: `le message de l'erreur`,
            type: `string`,
            example: `Erreur interne au serveur`
          }
        }
      }
    },
    parameters: {
      tagSearchTermInQuery: {
        name: `search`,
        in: `query`,
        description: `Terme à rechercher dans les mots-clé`,
        type: `string`,
        example: `urba`,
        required: false
      },
      tagSearchResultsInQuery: {
        name: `results`,
        in: `query`,
        description: `Nombre de résultat à renvoyer (10 par défaut si non remplie). Mettre la valeur all pour renvoyer tous les résultats.`,
        type: `string`,
        example: 10,
        required: false
      },
      zoneSearchTermInQuery: {
        name: `search`,
        in: `query`,
        description: `Terme à rechercher dans les zones`,
        type: `string`,
        example: `Paris`,
        required: true
      },
      zoneIdInPath: {
        name: `id`,
        in: `path`,
        description: `Identifiant geohisto de la zone`,
        required: true,
        type: `string`,
        example: `fr:departement:63@1860-07-01`
      },
      credentialsInBody: {
        name: `credentials`,
        in: `body`,
        description: `Identifiants pour se connecter`,
        required: true,
        schema: {
          type: `object`,
          required: [`email`, `password`],
          properties: {
            email: {
              description: `email`,
              type: `string`,
              example: `prenom.nom@developpement-durable.gouv.fr`
            },
            password: {
              description: `Description du fichier descriptif`,
              type: `string`,
              example: `monSuperPassword`
            }
          }
        }
      },
      uploadedFileNameInHeader: {
        name: `x-uploadedfile-name`,
        in: `header`,
        description: `Nom du fichier`,
        required: true,
        type: `string`,
        example: `ma-super-image.png`
      },
      uploadedFileContentInBody: {
        name: `file`,
        in: `formData`,
        description: `Le fichier descriptif à envoyer`,
        type: `file`,
        required: true
      },
      tokenFileInPath: {
        name: `tokenFile`,
        in: `path`,
        description: `Identifiant du fichier téléversé`,
        required: true,
        type: `string`,
        example: `6886999e-9b27-478b-8876-d9a4dbe57d5c`
      },
      messageIdInPath: {
        name: `id`,
        in: `path`,
        description: `Identifiant du message`,
        required: true,
        type: `string`,
        example: `5a6b984705e2750395113d61`
      },
      messageInBody: {
        name: `message`,
        in: `body`,
        description: `Message lu ou non lu ?`,
        required: true,
        schema: {
          type: `object`,
          required: [`read`],
          properties: {
            read: {
              description: `Le message est-il lu ?`,
              type: `boolean`,
              example: true
            }
          }
        }
      },
      datasetInBody: {
        name: `dataset`,
        in: `body`,
        description: `Metadonnées du jeu de données`,
        required: true,
        schema: {
          type: `object`,
          required: [`title`, `description`, `organization`, `topic`, `license`, `frequency`],
          properties: {
            title: {
              description: `Titre du jeu de données`,
              type: `string`,
              example: `Le titre de mon jeu de données`
            },
            description: {
              description: `Description du jeu de données`,
              type: `string`,
              example: `Une description qui peut être plus ou moins longue`
            },
            organization: {
              type: `string`,
              description: `Identifiant de l'organisation`,
              format: `ObjectId`,
              example: `5a27d86005e27526c52d395e`
            },
            topic: {
              description: `Thème du jeu de données (liste limitée)`,
              type: `string`,
              example: `Environnement`
            },
            tags: {
              type: `array`,
              description: `Liste des mot-clés du jeu de données (liste limitée)`,
              items: {
                type: `string`,
                description: `un mot-clé`,
                example: `agenda-21`
              }
            },
            license: {
              description: `Licence sous laquelle est publiée le jeu de données (liste limitée)`,
              type: `string`,
              example: `ODbL-1.0`
            },
            frequency: {
              description: `Fréquence d'actualisation du jeu de données (liste limitée)`,
              type: `string`,
              example: `annual`
            },
            frequency_date: {
              description: `Prochaine date d'actualisation du jeu de données (obligatoire dés que frequency n'est pas égal à unknown) - format iso 8601`,
              type: `string`,
              format: `date-time`,
              example: `2018-01-26`
            },
            spatial: {
              type: `object`,
              description: `Informations spatiales du jeu de données`,
              properties: {
                granularity: {
                  description: `Granularité du jeu de données (liste limitée)`,
                  type: `string`,
                  example: `country`
                },
                zones: {
                  type: `array`,
                  description: `Liste de zones géographiques du jeu de données (doit correspondre à un identifiant geohisto)`,
                  items: {
                    type: `string`,
                    description: `une zone géographique`,
                    example: `country:fr`
                  }
                }
              }
            },
            temporal_coverage: {
              type: `object`,
              description: `Couverture temporelle du jeu de données`,
              required: [`start`, `end`],
              properties: {
                start: {
                  description: `Date de début de la couverture temporelle du jeu de données - format YYYY-MM-DD`,
                  type: `string`,
                  example: `2017-01-01`
                },
                end: {
                  description: `Date de fin de la couverture temporelle du jeu de données - format YYYY-MM-DD`,
                  type: `string`,
                  example: `2017-06-30`
                }
              }
            },
            caution: {
              description: `Mise en garde concernant le jeu de données`,
              type: `string`,
              example: `Ces données .....`
            }
          }
        }
      },
      datasetIdInPath: {
        name: `id`,
        in: `path`,
        description: `Identifiant du jeu de données`,
        required: true,
        type: `string`,
        example: `5a6b984705e2750395113d61`
      },
      tokenFileInBody: {
        name: `tokenFile`,
        in: `body`,
        description: `Identifiant du fichier téléversé`,
        required: true,
        schema: {
          type: `object`,
          required: [`tokenFile`],
          properties: {
            tokenFile: {
              description: `Identifiant du fichier téléversé`,
              type: `string`,
              example: `6886999e-9b27-478b-8876-d9a4dbe57d5c`
            }
          }
        }
      },
      tokenFileAndMillesimeDateInBody: {
        name: `tokenFileAndMillesime`,
        in: `body`,
        description: `Identifiant du fichier téléversé et de son millésime`,
        required: true,
        schema: {
          type: `object`,
          required: [`tokenFile`,`millesime`],
          properties: {
            tokenFile: {
              description: `Identifiant du fichier téléversé`,
              type: `string`,
              example: `6886999e-9b27-478b-8876-d9a4dbe57d5c`
            },
            millesime: {
              description: `Le millésime du fichier descriptif - format YYYY-MM`,
              type: `string`,
              format: `date-time`,
              example: `2017-10`
            }
          }
        }
      },
      newAttachmentInBody: {
        name: `attachmentPayload`,
        in: `body`,
        description: `Données pour créer le fichier descriptif`,
        required: true,
        schema: {
          type: `object`,
          required: [`title`, `description`, `published`, `tokenFile`],
          properties: {
            title: {
              description: `Titre du fichier descriptif`,
              type: `string`,
              example: `Le titre de mon fichier descriptif`
            },
            description: {
              description: `Description du fichier descriptif`,
              type: `string`,
              example: `Ce fichier descriptif.......`
            },
            published: {
              description: `Date de publication du fichier descriptif - format iso 8601`,
              type: `string`,
              format: `date-time`,
              example: `2017-10-28`
            },
            tokenFile: {
              description: `Identifiant du fichier téléversé`,
              type: `string`,
              example: `6886999e-9b27-478b-8876-d9a4dbe57d5c`
            }
          }
        }
      },
      attachmentMetadataInBody: {
        name: `attachment`,
        in: `body`,
        description: `Métadonnées d'un fichier descriptif`,
        required: true,
        schema: {
          type: `object`,
          required: [`title`, `description`, `published`],
          properties: {
            title: {
              description: `Titre du fichier descriptif`,
              type: `string`,
              example: `Le titre de mon fichier descriptif`
            },
            description: {
              description: `Description du fichier descriptif`,
              type: `string`,
              example: `Ce fichier descriptif.......`
            },
            published: {
              description: `Date de publication du fichier descriptif - format iso 8601`,
              type: `string`,
              format: `date-time`,
              example: `2017-10-28`
            }
          }
        }
      },
      attachmentRidInPath: {
        name: `rid`,
        in: `path`,
        description: `Identifiant du fichier descriptif`,
        required: true,
        type: `string`,
        example: `6886999e-9b27-478b-8876-d9a4dbe57d5c`
      },
      newDatafileInBody: {
        name: `datafilePayload`,
        in: `body`,
        description: `Données pour créer le fichier descriptif`,
        required: true,
        schema: {
          type: `object`,
          required: [`title`, `description`, `published`, `millesime`, `tokenFile`],
          properties: {
            title: {
              description: `Titre du fichier descriptif`,
              type: `string`,
              example: `Le titre de mon fichier descriptif`
            },
            description: {
              description: `Description du fichier descriptif`,
              type: `string`,
              example: `Ce fichier descriptif.......`
            },
            published: {
              description: `Date de publication du fichier descriptif - format iso 8601`,
              type: `string`,
              format: `date-time`,
              example: `2017-10-28`
            },
            temporal_coverage_start: {
              description: `Date de début de la couverture temporelle du fichier de données - format YYYY-MM-DD`,
              type: `string`,
              format: `date-time`,
              example: `2017-01-01`
            },
            temporal_coverage_end: {
              description: `Date de fin de la couverture temporelle du fichier de données - format YYYY-MM-DD`,
              type: `string`,
              format: `date-time`,
              example: `2017-06-30`
            },
            legal_notice: {
              description: `Notice légale concernant le fichier de données`,
              type: `string`,
              example: `Ces données.......`
            },
            millesime: {
              description: `Le millésime du fichier descriptif - format YYYY-MM`,
              type: `string`,
              format: `date-time`,
              example: `2017-10`
            },
            tokenFile: {
              description: `Identifiant du fichier téléversé`,
              type: `string`,
              example: `6886999e-9b27-478b-8876-d9a4dbe57d5c`
            }
          }
        }
      },
      datafileMetadataInBody: {
        name: `datafile`,
        in: `body`,
        description: `Metadonnées du fichier de données`,
        required: true,
        schema: {
          type: `object`,
          required: [`title`, `description`, `published`],
          properties: {
            title: {
              description: `Titre du fichier de données`,
              type: `string`,
              example: `Le titre de mon fichier de données`
            },
            description: {
              description: `Description du fichier de données`,
              type: `string`,
              example: `Ce fichier de données.......`
            },
            published: {
              description: `Date de publication du fichier de données - format iso 8601`,
              type: `string`,
              format: `date-time`,
              example: `2017-10-28`
            },
            temporal_coverage_start: {
              description: `Date de début de la couverture temporelle du fichier de données - format YYYY-MM-DD`,
              type: `string`,
              format: `date-time`,
              example: `2017-01-01`
            },
            temporal_coverage_end: {
              description: `Date de fin de la couverture temporelle du fichier de données - format YYYY-MM-DD`,
              type: `string`,
              format: `date-time`,
              example: `2017-06-30`
            },
            legal_notice: {
              description: `Notice légale concernant le fichier de données`,
              type: `string`,
              example: `Ces données.......`
            }
          }
        }
      },
      datafileRidInPath: {
        name: `rid`,
        in: `path`,
        description: `Identifiant du fichier de données`,
        required: true,
        type: `string`,
        example: `2f48a6cd-b147-4750-aa70-990a5c17f536`
      },
      datafileMillesimeInPath: {
        name: `millesime`,
        in: `path`,
        description: `millésime du fichier de données`,
        required: true,
        type: `string`,
        format: `date-time`,
        example: `2019-07`
      },
      jobIdInPath: {
        name: `id`,
        in: `path`,
        description: `Identifiant de la tâche`,
        required: true,
        type: `integer`,
        example: 1
      }
    },
    responses: {
      listLicensesResponse: {
        description: `Réponse avec une liste de licences`,
        schema: { $ref: `#/definitions/ListLicenses` }
      },
      listTopicsResponse: {
        description: `Réponse avce une liste de thèmes`,
        schema: { $ref: `#/definitions/ListTopics` }
      },
      listFrequenciesResponse: {
        description: `Réponse avec une liste de fréquences de mise-à-jour`,
        schema: { $ref: `#/definitions/ListFrequencies` }
      },
      listTagsResponse: {
        description: `Réponse avec une liste de mot-clés`,
        schema: { $ref: `#/definitions/ListTags` }
      },
      listGranularitiesResponse: {
        description: `Réponse avec une liste de granularités spatiales`,
        schema: { $ref: `#/definitions/ListGranularities` }
      },
      listZonesResponse: {
        description: `Réponse avec une liste de zones`,
        schema: { $ref: `#/definitions/ListZones` }
      },
      zoneResponse: {
        description: `Réponse avec le détail d'une zone`,
        schema: { $ref: `#/definitions/Zone` }
      },
      listOrganizationsResponse: {
        description: `Réponse avec une liste dorganisations`,
        schema: { $ref: `#/definitions/ListOrganizations` }
      },
      listnomenclaturesResponse: {
        description: `Réponse avec une liste des nomenclatures`,
        schema: { $ref: `#/definitions/ListNomenclatures` }
      },
      meResponse: {
        description: `Réponse avec l'utilisateur authentifié`,
        schema: { $ref: `#/definitions/Me` }
      },
      myInfosResponse: {
        description: `Réponse avec les infos concernant l'utilisateur authentifié`,
        schema: { $ref: `#/definitions/MyInfos` }
      },
      listUploadeFilesResponse: {
        description: `Réponse avec une liste de fichiers téléversés`,
        schema: { $ref: `#/definitions/ListUploadedFiles` }
      },
      uploadedFileResponse: {
        description: `Réponse avec le détail d'un fichier téléversé`,
        schema: { $ref: `#/definitions/UploadedFile` }
      },
      tokenFileResponse: {
        description: `Réponse avec le token du fichier téléversé`,
        schema: { $ref: `#/definitions/TokenFile` }
      },
      resultCheckCsvResponse: {
        description: `Le résultat d'une validation d'un fichier csv augmenté`,
        schema: { $ref: `#/definitions/ResultCheckCsv` }
      },
      listMessagesResponse: {
        description: `Réponse avec une liste de messages`,
        schema: { $ref: `#/definitions/ListMessages` }
      },
      messageResponse: {
        description: `Réponse avec le détail d'un message`,
        schema: { $ref: `#/definitions/Message` }
      },
      listDatasetsResponse: {
        description: `Réponse avec une liste de jeux de données`,
        schema: { $ref: `#/definitions/ListDatasets` }
      },
      datasetResponse: {
        description: `Réponse avec le détail d'un jeu de données`,
        schema: { $ref: `#/definitions/Dataset` }
      },
      listAttachmentsResponse: {
        description: `Réponse avec une liset de fichiers descriptifs`,
        schema: { $ref: `#/definitions/ListAttachments` }
      },
      attachmentResponse: {
        description: `Réposne avec le détail d'un fichier descriptif`,
        schema: { $ref: `#/definitions/Attachment` }
      },
      listDatafilesResponse: {
        description: `Réposne avec une liste de fichiers de données`,
        schema: { $ref: `#/definitions/ListDatafiles` }
      },
      datafileResponse: {
        description: `Réponse avec le détail d'un fichier de données`,
        schema: { $ref: `#/definitions/Datafile` }
      },
      listLogsResponse: {
        description: `Réponse avec une liste des modifications du Datalake`,
        schema: { $ref: `#/definitions/ListLogs` }
      },
      listDatafileJobsResponse: {
        description: `Réponse avec une liste de tâches d'intégration`,
        schema: { $ref: `#/definitions/ListDatafileJobs` }
      },
      datafileJobResponse: {
        description: `Réponse avec le détail d'une tâche d'intégration`,
        schema: { $ref: `#/definitions/DatafileJob` }
      },
      deletedResponse: {
        description: `Réponse pour une suppresssion`,
        schema: { }
      },
      validationErrorResponse: {
        description: `Réponse dans le cas d'une erreur de validation`,
        schema: { $ref: `#/definitions/ValidationError` }
      },
      businessRulesErrorResponse: {
        description: `Réponse dansle cas d'une erreur métier`,
        schema: { $ref: `#/definitions/BusinessRulesError` }
      },
      unauthorizedErrorResponse: {
        description: `Réponse si une authentification requise`,
        schema: { $ref: `#/definitions/UnauthorizedError` }
      },
      forbiddenErrorResponse: {
        description: `Réponse si les droits d'accès sont insuffisants`,
        schema: { $ref: `#/definitions/ForbiddenError` }
      },
      notFoundErrorResponse: {
        description: `Réponse si élément non trouvé`,
        schema: { $ref: `#/definitions/NotFoundError` }
      },
      serverErrorResponse: {
        description: `Réponse si erreur interne au serveur`,
        schema: { $ref: `#/definitions/ServerError` }
      }
    },
    securityDefinitions: {
      apiKeyInHeader: { type: `apiKey`, in: `header`, name: `x-api-key` }
    },
    externalDocs: { description: `Infos supplémentaires`, url: `http://dev.datalake.cgdd.e2.rie.gouv.fr/more` }
  }
}
