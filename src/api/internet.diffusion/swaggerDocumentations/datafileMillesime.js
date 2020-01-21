let { api_diffusion_internet: { exposed_url: apiUrl }, ihm_diffusion_url: ihmUrl } = require('../../../env')
let fullApiUrl = `${ apiUrl.scheme }://${ apiUrl.host }:${ apiUrl.port }/${ apiUrl.path }`

module.exports = {
  v1: datafileMillesimed => specs.v1(datafileMillesimed)
}

let specs = {
  v1: datafileMillesimed => {
    let orderByList = []
    let columnsList = []
    let rowObjectProperties = {}
    let filterParameters = []
    for (column of datafileMillesimed.columns) {
      orderByList.push(column.name)
      orderByList.push('-' + column.name)
      columnsList.push(column.name)
      rowObjectProperties[column.name] = { description: column.description }
      filterParameters.push({
        name: column.name,
        in: `query`,
        description: `Pour filtrer selon la valeur de ${ column.name }. Le format doit être de la forme "type_filtre:valeur_filtre". La liste des filtres disponibles pour cette colonne est: ${ column.filters.join(', ') }`,
        type: `string`,
        example: `eq:1`
      })
    }

    return {
      swagger: `2.0`,
      info: {
        title: `Datalake - API diffusion - Fichier de données`,
        description: `API de diffusion des données du Datalake sur Internet spécifique au millésime ${ datafileMillesimed.millesime } du fichier de données ${ datafileMillesimed.rid }`,
        version: `1.0.0`,
        termsOfService: `${ fullApiUrl }/termsofservice`,
        contact: { name: `Assistance API`, url: `${ fullApiUrl }/support`, email: `support-datalake@developpement-durable.gouv.fr` },
        license: { name: `Ma licence`, url: `${ fullApiUrl }/license` }
      },
      host: `${ apiUrl.host }:${ apiUrl.port }`,
      basePath: `/${ apiUrl.path }`,
      schemes: [apiUrl.scheme],
      tags: [
        { name: `metadata`, description: `Opérations sur les métadonnées du fichier` },
        { name: `rows`, description: `Opérations sur les lignes du fichier` },
        { name: `csv`, description: `Opérations sur les lignes du fichier` },
        { name: `referentiels`, description: `Opérations sur les référentiels utilisés par le Datalake` },
        { name: `nomenclatures`, description: `Opérations sur les nomenclatures utilisés par le Datalake` }
      ],
      produces: [`application/json`, `text/csv; charset=utf-8`],
      paths: {
        [`/v1/datafiles/${ datafileMillesimed.rid }?millesime=${ datafileMillesimed.millesime }`]: {
          get: {
            tags: [`metadata`],
            summary: `Obtenir les métadonnées`,
            description: `Cette opération permet de récupérer les métadonnées du millésime ${ datafileMillesimed.millesime } du fichier de données ${ datafileMillesimed.rid }`,
            operationId: `getmetadata`,
            produces: [`application/json`],
            responses: {
              '200': { $ref: `#/responses/datafileMillesimeResponse` },
              '400': { $ref: `#/responses/validationErrorResponse` },
              '500': { $ref: `#/responses/serverErrorResponse` }
            }
          }
        },
        [`/v1/datafiles/${ datafileMillesimed.rid }/rows?millesime=${ datafileMillesimed.millesime }`]: {
          get: {
            tags: [`rows`],
            summary: `Obtenir les données paginées`,
            description: `Cette opération permet de récupérer les données paginées du millésime ${ datafileMillesimed.millesime } du fichier de données ${ datafileMillesimed.rid }`,
            operationId: `getrows`,
            parameters: [
              { $ref: `#/parameters/page` },
              { $ref: `#/parameters/pageSize` },
              { $ref: `#/parameters/orderBy` },
              { $ref: `#/parameters/columns`}
            ].concat(filterParameters),
            produces: [`application/json`],
            responses: {
              '200': { $ref: `#/responses/datafileMillesimeRowsResponse` },
              '400': { $ref: `#/responses/validationErrorResponse` },
              '500': { $ref: `#/responses/serverErrorResponse` }
            }
          }
        },
        [`/v1/datafiles/${ datafileMillesimed.rid }/csv?millesime=${ datafileMillesimed.millesime }`]: {
          get: {
            tags: [`csv`],
            summary: `Télécharger en csv`,
            description: `Cette opération permet de récupérer au format csv le millésime ${ datafileMillesimed.millesime } du fichier de données ${ datafileMillesimed.rid }`,
            operationId: `getcsv`,
            parameters: [
              { $ref: `#/parameters/withColumnName` },
              { $ref: `#/parameters/withColumnDescription` },
              { $ref: `#/parameters/withColumnUnit` },
              { $ref: `#/parameters/orderBy` },
              { $ref: `#/parameters/columns`}
            ].concat(filterParameters),
            produces: [`text/csv; charset=utf-8`],
            responses: {
              '200': { $ref: `#/responses/datafileMillesimeCsvResponse` },
              '400': { $ref: `#/responses/validationErrorResponse` },
              '500': { $ref: `#/responses/serverErrorResponse` }
            }
          }
        },
        '/v1/referentiels/polluant_Eau': {
          get: {
            tags: [`referentiels`],
            summary: `Lister tous les référentiels de type " polluant_Eau " disponibles`,
            description: `Permet d'obtenir la liste des référentiels de type " polluant_Eau " disponibles dans le Datalake`,
            operationId: `list_refs_polluant_Eau`,
            produces: [`application/json`],
            responses: {
              '200': { $ref: `#/responses/listRefPolluantEauResponse` },
              default: { $ref: `#/responses/serverErrorResponse` }
            }
          }
        },
        '/v1/referentiels/port': {
          get: {
            tags: [`referentiels`],
            summary: `Lister tous les référentiels de type " port " disponibles`,
            description: `Permet d'obtenir la liste des référentiels de type " port " disponibles dans le Datalake`,
            operationId: `list_refs_port`,
            produces: [`application/json`],
            responses: {
              '200': { $ref: `#/responses/listRefPortResponse` },
              default: { $ref: `#/responses/serverErrorResponse` }
            }
          }
        },
        '/v1/referentiels/station_Air': {
          get: {
            tags: [`referentiels`],
            summary: `Lister tous les référentiels de type " station_Air " disponibles`,
            description: `Permet d'obtenir la liste des référentiels de type " station_Air " disponibles dans le Datalake`,
            operationId: `list_refs_station_Air`,
            produces: [`application/json`],
            responses: {
              '200': { $ref: `#/responses/listRefStationAirResponse` },
              default: { $ref: `#/responses/serverErrorResponse` }
            }
          }
        },
        '/v1/referentiels/station_Esu': {
          get: {
            tags: [`referentiels`],
            summary: `Lister tous les référentiels de type " station_Esu " disponibles`,
            description: `Permet d'obtenir la liste des référentiels de type " station_Esu " disponibles dans le Datalake`,
            operationId: `list_refs_station_Esu`,
            produces: [`application/json`],
            responses: {
              '200': { $ref: `#/responses/listRefrefStationEsuResponse` },
              default: { $ref: `#/responses/serverErrorResponse` }
            }
          }
        },
        '/v1/referentiels/allTags': {
          get: {
            tags: [`referentiels`],
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
        '/v1/nomenclatures/bilanEnergie': {
          get: {
            tags: [`nomenclatures`],
            summary: `Lister tous les nomenclatures de type " bilanEnergie " disponibles `,
            description: `Permet d'obtenir la liste des nomenclatures de type " bilanEnergie " dans le Datalake`,
            operationId: `list_nomenclatures_bilanEnergie`,
            produces: [`application/json`],
            responses: {
              '200': { $ref: `#/responses/listNomencBilanEnergieResponse` },
              default: { $ref: `#/responses/serverErrorResponse` }
            }
          }
        },
        '/v1/nomenclatures/csl_filiere': {
          get: {
            tags: [`nomenclatures`],
            summary: `Lister tous les nomenclatures de type " csl_filiere " disponibles `,
            description: `Permet d'obtenir la liste des nomenclatures de type " csl_filiere " dans le Datalake`,
            operationId: `list_nomenclatures_csl_filiere`,
            produces: [`application/json`],
            responses: {
              '200': { $ref: `#/responses/listNomencCslFiliereResponse` },
              default: { $ref: `#/responses/serverErrorResponse` }
            }
          }
        },
        '/v1/nomenclatures/csl_operation': {
          get: {
            tags: [`nomenclatures`],
            summary: `Lister tous les nomenclatures de type " csl_operation " disponibles `,
            description: `Permet d'obtenir la liste des nomenclatures de type " csl_operation " dans le Datalake`,
            operationId: `list_nomenclatures_csl_operation`,
            produces: [`application/json`],
            responses: {
              '200': { $ref: `#/responses/listNomencCslOperationResponse` },
              default: { $ref: `#/responses/serverErrorResponse` }
            }
          }
        }
      },
      definitions: {
        datafileMillesimeObject: {
          type: `object`,
          description: `Millesime d'un fichier de données`,
          required: [`rid`, `title`, `description`, `published`, `weburl`, `millesime`, `rows`, `columns`, `created_at`, `dataset`, `previous_millesime_href`, `next_millesime_href`],
          properties: {
            rid: {
              description: `Identifiant du fichier de données`,
              type: `string`,
              format: `uuid`,
              example: datafileMillesimed.rid
            },
            millesime: {
              description: `Le millésime du fichier descriptif - format YYYY-MM`,
              type: `string`,
              format: `date-time`,
              example: datafileMillesimed.millesime
            },
            date_diffusion: {
              description: `Date de diffusion du fichier de données - format YYYY-MM-DD`,
              type: `string`,
              format: `date`,
              example: `2017-10-28`
            },
            heure_diffusion: {
              description: `Heure de diffusion du fichier de données - format HH:mm`,
              type: `string`,
              format: `time`,
              example: `15:30`
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
            weburl: {
              description: `Url pour accéder à l'interface de visualisation du millésime du fichier de données`,
              type: `string`,
              example: `${ ihmUrl }/explore/dataset/${ datafileMillesimed.dataset.id }/datafile/${ datafileMillesimed.rid }?millesime=${ datafileMillesimed.millesime }`
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
            },
            rows: {
              description: `Nombre de lignes dans le millesime du fichier de données`,
              type: `integer`,
              example: 689
            },
            columns: {
              description: `Liste des colonnes du millesime du fichier de données`,
              type: `array`,
              items: { $ref: `#/definitions/columnObject` }
            },
            dataset: { $ref: `#/definitions/simpleDatasetObject` },
            previous_millesime_href: {
              description: `Lien api du précédent millésime de ce fichier de données (peut être égale à null)`,
              type: `string`,
              example: datafileMillesimed.previous_millesime_href
            },
            next_millesime_href: {
              description: `Lien api du millésime suivant de ce fichier de données (peut être égale à null)`,
              type: `string`,
              example: datafileMillesimed.next_millesime_href
            }
          }
        },
        simpleDatasetObject: {
          type: `object`,
          description: `un jeu de données`,
          required: [`id`, `title`, `description`, `organization`, `topic`, `license`, `tags`, `frequency`, `created_at`, `attachments`],
          properties: {
            id: {
              description: `Identifiant du jeu de données`,
              type: `string`,
              format: `ObjectId`,
              example: datafileMillesimed.dataset.id
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
                acronym: {
                  description: `Acronyme de l'organisation`,
                  type: `string`,
                  example: `CGDD/SDES/SDVSB/BSI`
                },
                description: {
                  description: `Description de l'organisation`,
                  type: `string`,
                  example: `Cette organisation est responsable de.....`
                }
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
                  description: `Liste de zones géographiques du jeu de données (correspond à un identifiant geohisto)`,
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
              $ref: `#/definitions/attachmentObject`
            },
            created_at: {
              description: `date de création du jeu de données - format iso 8601`,
              type: `string`,
              format: `date-time`,
              example: `2018-01-26T21:06:15.269Z`
            },
            last_modified: {
              description: `Date de dernière modification du jeu de données - format iso 8601`,
              type: `string`,
              format: `date-time`,
              example: `2018-01-27T02:38:37.653Z`
            }
          }
        },
        attachmentObject: {
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
        columnObject: {
          type: `object`,
          description: `Une colonne du fichier de données`,
          required: [`name`, `description`, `filters`],
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
            },
            filters: {
              description: `Liste des filtres disponibles pour cette colonne`,
              type: `array`,
              items: {
                type: `string`,
                description: `Un filtre de colonne`,
                enum: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'startsWith', 'endsWith'],
                example: `eq`
              }
            }
          }
        },
        paginatedRows: {
          type: `object`,
          descrription: `La pagination des lignes du fichier de données `,
          required: [`pageSize`, `total`, `page`, `firstPage`, `previousPage`, `nextPage`, `lastPage`, `data`],
          properties: {
            pageSize: {
              description: `le nombre de lignes dans la page`,
              type: `integer`,
              example: 20
            },
            page: {
              description: `le numéro de la page actuelle`,
              type: `integer`,
              example: 6
            },
            total: {
              description: `le nombre total de lignes`,
              type: `integer`,
              example: 199
            },
            firstPage: {
              description: `le lien vers la première page`,
              type: `string`,
              example: `${ fullApiUrl }v1/datafiles/${ datafileMillesimed.rid }/rows?millesime=${ datafileMillesimed.millesime }&page=1&PageSize=20`
            },
            previousPage: {
              description: `le lien vers la page précédente`,
              type: `string`,
              example: `${ fullApiUrl }v1/datafiles/${ datafileMillesimed.rid }/rows?millesime=${ datafileMillesimed.millesime }&page=5&PageSize=20`
            },
            nextPage: {
              description: `le lien vers la page suivante`,
              type: `string`,
              example: `${ fullApiUrl }v1/datafiles/${ datafileMillesimed.rid }/rows?millesime=${ datafileMillesimed.millesime }&page=7&PageSize=20`
            },
            lastPage: {
              description: `le lien vers la dernière page`,
              type: `string`,
              example: `${ fullApiUrl }v1/datafiles/${ datafileMillesimed.rid }/rows?millesime=${ datafileMillesimed.millesime }&page=10&PageSize=20`
            },
            data: {
              description: `Le tableau des lignes`,
              type: `array`,
              items: { $ref: `#/definitions/rowObject` },
            }
          }
        },
        rowObject: {
          type: `object`,
          description: `Une ligne de données`,
          properties: rowObjectProperties
        },
        ValidationError: {
          title: `Erreur de validation`,
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
              description: `La liste des différentes erreurs`,
              type: `array`,
              items: {
                type: `string`,
                description: `Un message d'erreur`,
                example: `Le champ "page" est requis et doit être un entier strictement positif`
              }
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
        },
        ListRefPolluantEau: {
          type: `array`,
          description: `Liste des referentiels`,
          items: { $ref: `#/definitions/refPolluantEau` }
        },
        ListRefPort: {
          type: `array`,
          description: `Liste des referentiels`,
          items: { $ref: `#/definitions/refPort` }
        },
        ListRefStationAir: {
          type: `array`,
          description: `Liste des referentiels`,
          items: { $ref: `#/definitions/refStationAir` }
        },
        ListRefrefStationEsu: {
          type: `array`,
          description: `Liste des referentiels`,
          items: { $ref: `#/definitions/refStationEsu` }
        },
        ListTags: {
          type: `array`,
          description: `Liste de mots-clé`,
          items: { $ref: `#/definitions/listAllTags` }
        },
        PolluantEau: {
          type: `object`,
          description: `nomenclature PolluantEau`,
          required: [`code`, `unit`],
          properties: {
            code: {
              description: `Identifiant`,
              type: `string`,
              example: `1109`
            },
            name: {
              description: `Nom de la polluant d'eau`,
              type: `string`,
              example: `Atrazine déisopropyl`
            },
            unit: {
              description: `unité de la polluant d'eau`,
              type: `string`,
              example: `µg/L`
            }
          }
        },
        Port: {
          type: `object`,
          description: `référentiel Port`,
          required: [`mca_code`,`mca_name`,`code`, `name`],
          properties: {
            mca_code: {
              description: `Code MCA`,
              type: `string`,
              example: `FR01`
            },
            mca_name: {
              description: `Nom MCA`,
              type: `string`,
              example: `FRANCE: Atlantic and North Sea`
            },
            code: {
              description: `Identifiant`,
              type: `string`,
              example: `FRBOL`
            },
            name: {
              description: `Nom du port`,
              type: `string`,
              example: `Boulogne-sur-Mer`
            }
          }
        },
        Location: {
          type: `object`,
          description: `localisation`,
          required: [`type`, `coordinates`],
          properties: {
            type: {
              description: `Le type de l'mplacement`,
              type: `string`,
              enum: [`Point`],
              example: `Point`
            },
            coordinates: {
              type: `object`,
              description: `les coordonnées de la référence`,
              required: [`longitude`, `latitude`],
              properties: {
                longitude: {
                  description: `La longitude`,
                  type: `float`,
                  example: 1.4035470518
                },
                latitude: {
                  description: `La latitude`,
                  type: `float`,
                  example: 49.3677071211
                },
                altitude: {
                  description: `L'altitude'`,
                  type: `float`,
                  example: 118
                },
              }
            }
          }
        },
        Validity: {
          type: `object`,
          description: `période de validité`,
          required: [`start`],
          properties: {
            start: {
              description: `Date de début de la validité`,
              type: `date-time`,
              example: `2018-01-26T21:06:55.277Z`
            },
            end: {
              description: `Date de fin de la validité`,
              type: `date-time`,
              example: `2019-01-26T21:06:55.277Z`
            },
          }
        },
        StationAir: {
          type: `object`,
          description: `référentiel station_air`,
          required: [`code`, `name`, `code_zas`, `code_zas`, `name_zas`, `commune`, `aasqa`, `location`, `validity`, `sector_type`, `millesime`],
          properties: {
            code: {
              description: `Identifiant`,
              type: `string`,
              example: `01005`
            },
            name: {
              description: `Nom`,
              type: `string`,
              example: `Hayange`
            },
            code_zas: {
              description: `Code ZAS`,
              type: `string`,
              example: `FR01A01`
            },
            name_zas: {
              description: `Nom ZAS`,
              type: `string`,
              example: `LORRAINE-METZ`
            },
            commune: {
              description: `Code ZAS`,
              type: `string`,
              example: `57306`
            },
            aasqa: {
              description: `Nom ZAS`,
              type: `string`,
              example: `AIR LORRAINE (04)`
            },
            location: {
              type: `array`,
              description: ``,
              items: { $ref: `#/definitions/Location` }
            },
            validity: {
              type: `array`,
              description: `la durée de validité`,
              items: { $ref: `#/definitions/Validity` }
            },
            sector_type: {
              description: `le type de secteur`,
              type: `string`,
              example: `sector_type`
            },
            millesime: {
              description: `le millésime du réferentiel`,
              type: `Integer`,
              example: 2017
            },
            impact_pm10: {
              description: `l'impact en PM10`,
              type: `string`,
              example: `fond`
            },
            impact_no2: {
              description: `l'impact en No2`,
              type: `string`,
              example: `fond`
            },
            impact_o3: {
              description: `l'impact en O3`,
              type: `string`,
              example: `fond`
            },
            impact_so2: {
              description: `l'impact en So2`,
              type: `string`,
              example: `fond`
            },
            impact_pm25: {
              description: `l'impact en PM25`,
              type: `string`,
              example: `fond`
            },
            impact_co: {
              description: `l'impact en Co`,
              type: `string`,
              example: `fond`
            }
          }
        },
        StationEsu: {
          type: `object`,
          description: `référentiel StationEsu`,
          required: [`code`,`location`],
          properties: {
            location: {
              type: `array`,
              description: ``,
              items: { $ref: `#/definitions/Location` }
            },
            code: {
              description: `Identifiant`,
              type: `string`,
              example: `K021510`
            }
          }
        },
        refPolluantEau:{
          type: `object`,
          description: `La liste des Référentiel de type " polluante_eau "`,
          required: [`polluant_eau`],
          properties: {
            polluant_eau: {
              type: `array`,
              description: `Référentiel polluant_eau`,
              items: { $ref: `#/definitions/PolluantEau` }
            }
          }
        },
        refPort:{
          type: `object`,
          description: `La liste des Référentiel de type " Port "`,
          required: [`port`],
          properties: {
            Port: {
              type: `array`,
              description: `Référentiel port`,
              items: { $ref: `#/definitions/Port` }
            }
          }
        },
        refStationAir:{
          type: `object`,
          description: `La liste des Référentiel de type " station_air "`,
          required: [`station_air`],
          properties: {
            station_air: {
              type: `array`,
              description: `Référentiel station_air`,
              items: { $ref: `#/definitions/StationAir` }
            }
          }
        },
        refStationEsu:{
          type: `object`,
          description: `La liste des Référentiel de type " station_esu "`,
          required: [`station_esu`],
          properties: {
            station_esu: {
              type: `array`,
              description: `Référentiel station_esu`,
              items: { $ref: `#/definitions/StationEsu` }
            }
          }
        },
        listAllTags:{
          type: `object`,
          description: `La liste des mots-clé du Datalake`,
          required: [`Tag`],
          properties: {
            All_Tags: {
              type: `array`,
              description: `Liste de mots-clé`,
              items: { $ref: `#/definitions/Tag` }
            }
          }
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
        ListNomencBilanEnergie: {
          type: `array`,
          description: `Liste des nomenclatures de type " BilanEnergie "`,
          items: { $ref: `#/definitions/NomencBilanEnergie` }
        },
        ListNomencCslFiliere: {
          type: `array`,
          description: `Liste des nomenclatures de type " csl_filiere "`,
          items: { $ref: `#/definitions/NomencCslFiliere` }
        },
        ListNomencCslOperation: {
          type: `array`,
          description: `Liste des nomenclatures de type " csl_peration "`,
          items: { $ref: `#/definitions/NomencCslOperation` }
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
        NomencBilanEnergie:{
          type: `object`,
          description: `La liste des nomenclatures de type " BilanEnergie "`,
          required: [`bilan_Energie`],
          properties: {
            bilan_Energie: {
              type: `array`,
              description: `Nomenclature bilan d'energie`,
              items: { $ref: `#/definitions/BilanEnergie` }
            }
          }
        },
        NomencCslFiliere:{
          type: `object`,
          description: `La liste des nomenclatures de type " csl_filiere "`,
          required: [`csl_filiere`],
          properties: {
            csl_filiere: {
              type: `array`,
              description: `Nomenclature csl_filiere`,
              items: { $ref: `#/definitions/Csl_filiere` }
            }
          }
        },
        NomencCslOperation:{
          type: `object`,
          description: `La liste des nomenclatures de type " csl_operation "`,
          required: [`csl_operation`],
          properties: {
  
            csl_operation: {
              type: `array`,
              description: `Nomenclature csl_operation`,
              items: { $ref: `#/definitions/Csl_operation` }
            },
          }
        }
      },
      parameters: {
        page: {
          name: `page`,
          in: `query`,
          description: `Numéro de la page à afficher`,
          required: true,
          type: `integer`,
          format: `int32`,
          default: 1
        },
        pageSize: {
          name: `pageSize`,
          in: `query`,
          description: `Nombre de lignes par page`,
          required: true,
          type: `integer`,
          format: `int32`,
          default: 20,
          enum: [10, 20, 50, 100]
        },
        withColumnName: {
          name: `withColumnName`,
          in: `query`,
          description: `faut-il ajouter le nom des colonnes en entête du fichier csv ?`,
          required: true,
          type: `boolean`,
          default: true
        },
        withColumnDescription: {
          name: `withColumnDescription`,
          in: `query`,
          description: `faut-il ajouter la description des colonnes en entête du fichier csv ?`,
          required: true,
          type: `boolean`,
          default: true
        },
        withColumnUnit: {
          name: `withColumnUnit`,
          in: `query`,
          description: `faut-il ajouter l'unité des colonnes en entête du fichier csv ?`,
          required: true,
          type: `boolean`,
          default: false
        },
        orderBy: {
          name: `orderBy`,
          in: `query`,
          description: `Options de tri`,
          required: false,
          type: `array`,
          collectionFormat: `csv`,
          allowEmptyValue: false,
          items: {
            type: `string`,
            enum: orderByList
          }
        },
        columns: {
          name: `columns`,
          in: `query`,
          description: `Les colonnes à récupérer`,
          required: false,
          type: `array`,
          collectionFormat: `csv`,
          allowEmptyValue: false,
          items: {
            type: `string`,
            enum: columnsList
          }
        }
      },
      responses: {
        datafileMillesimeResponse: {
          description: `Réponse avec le détail d'un millésime d'un fichier de données`,
          schema: { $ref: `#/definitions/datafileMillesimeObject` }
        },
        datafileMillesimeCsvResponse: {
          description: `Réponse avec le millésime du fichier de données au format csv`,
          schema: { type: `file` }
        },
        datafileMillesimeRowsResponse: {
          description: `Réponse avec le millésime du fichier de données paginée`,
          schema: { $ref: `#/definitions/paginatedRows` }
        },
        validationErrorResponse: {
          description: `Réponse dans le cas d'une erreur de validation`,
          schema: { $ref: `#/definitions/ValidationError` }
        },
        serverErrorResponse: {
          description: `Réponse si erreur interne au serveur`,
          schema: { $ref: `#/definitions/ServerError` }
        },
        listRefPolluantEauResponse: {
          description: `Réponse avec une liste de référentiels`,
          schema: { $ref: `#/definitions/ListRefPolluantEau` }
        },
        listRefPortResponse: {
          description: `Réponse avec une liste de référentiels`,
          schema: { $ref: `#/definitions/ListRefPort` }
        },
        listRefStationAirResponse: {
          description: `Réponse avec une liste de référentiels`,
          schema: { $ref: `#/definitions/ListRefStationAir` }
        },
        listRefrefStationEsuResponse: {
          description: `Réponse avec une liste de référentiels`,
          schema: { $ref: `#/definitions/ListRefrefStationEsu` }
        },
        listTagsResponse: {
          description: `Réponse avec une liste de mot-clés`,
          schema: { $ref: `#/definitions/ListTags` }
        },
        listNomencBilanEnergieResponse: {
          description: `Réponse avec une liste de nomenclatures de type " BilanEnergie "`,
          schema: { $ref: `#/definitions/ListNomencBilanEnergie` }
        },
        listNomencCslFiliereResponse: {
          description: `Réponse avec une liste de référentiels`,
          schema: { $ref: `#/definitions/ListNomencCslFiliere` }
        },
        listNomencCslOperationResponse: {
          description: `Réponse avec une liste de référentiels`,
          schema: { $ref: `#/definitions/ListNomencCslOperation` }
        }
      },
      externalDocs: { description: `Infos supplémentaires`, url: `${ fullApiUrl }/more` }
    }
  }
}
