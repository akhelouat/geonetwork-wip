import { TestBed } from '@angular/core/testing'
import { ElasticsearchMapper } from './elasticsearch.mapper'
import {
  hitsOnly,
  ES_FIXTURE_FULL_RESPONSE,
  MetadataUrlService,
  MetadataRecord,
} from '@geonetwork-ui/util/shared'

const metadataUrlServiceMock = {
  translate: undefined,
  getUrl: () => 'url',
}
describe('ElasticsearchMapper', () => {
  let service: ElasticsearchMapper

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MetadataUrlService,
          useValue: metadataUrlServiceMock,
        },
      ],
    })
    service = TestBed.inject(ElasticsearchMapper)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('#toRecords', () => {
    it('Output records', () => {
      const summary = service.toRecords(hitsOnly)
      expect(summary).toEqual([
        {
          abstract: 'The grid is based on proposal ',
          id: '12456',
          metadataUrl: 'url',
          thumbnailUrl: 'data:image/png;base64,',
          title: 'EEA reference grid for Germany (10km), May 2013',
          uuid: '20e9e1a1-83c1-4f13-89ef-c19767d6ee18f',
          catalogUuid: '6731be1e-6533-44e0-9b8a-580b45e36e80',
        },
        {
          abstract: 'Reference layer of the rivers sensitive areas, ',
          id: '12442',
          metadataUrl: 'url',
          thumbnailUrl: 'data:image/png;base64,',
          title:
            'Urban Waste Water Treatment Directive, Sensitive areas - rivers reported under UWWTD data call 2015, Nov. 2017',
          uuid: '5b35f06e-8c6b-4907-b8f4-39541d170360',
          catalogUuid: '6731be1e-6533-44e0-9b8a-580b45e36e80',
        },
      ])
    })
  })

  describe('#toRecord', () => {
    let hit
    beforeEach(() => {
      hit = hitsOnly.hits.hits[0]
    })

    describe('overview', () => {
      it('when data', () => {
        const summary = service.toRecord(hit)
        expect(summary.thumbnailUrl).toBe('data:image/png;base64,')
      })
      it('when no data and url', () => {
        hit._source.overview = {
          url: 'imgUrl',
        }
        const summary = service.toRecord(hit)
        expect(summary.thumbnailUrl).toBe('http://localhost/imgUrl')
      })
      it('when no data no url', () => {
        hit._source.overview = {}
        const summary = service.toRecord(hit)
        expect(summary.thumbnailUrl).toBe(null)
      })
    })

    describe('links', () => {
      describe('valid link with a protocol and name', () => {
        beforeEach(() => {
          hit._source.link = [
            {
              protocol: 'MY-PROTOCOL',
              name: 'my data layer',
              url: 'https://my.website/services/data/',
            },
          ]
        })
        it('parses as a valid link, uses name as label', () => {
          const summary = service.toRecord(hit)
          expect(summary.links).toEqual([
            {
              protocol: 'MY-PROTOCOL',
              name: 'my data layer',
              label: 'my data layer',
              url: 'https://my.website/services/data/',
            },
          ])
        })
      })
      describe('valid link pointing to a file', () => {
        beforeEach(() => {
          hit._source.link = [
            {
              description: 'Download this file!',
              url: 'https://my.website/services/static/data.csv',
            },
          ]
        })
        it('parses as a valid link, uses description as label', () => {
          const summary = service.toRecord(hit)
          expect(summary.links).toEqual([
            {
              description: 'Download this file!',
              label: 'Download this file!',
              url: 'https://my.website/services/static/data.csv',
              name: 'data.csv',
            },
          ])
        })
      })
      describe('invalid link (no url)', () => {
        beforeEach(() => {
          hit._source.link = [
            {
              description: 'Download this file!',
              protocol: 'FILE',
            },
          ]
        })
        it('parses as an invalid link', () => {
          const summary = service.toRecord(hit)
          expect(summary.links).toEqual([
            {
              invalid: true,
              reason: expect.stringContaining('URL'),
            },
          ])
        })
      })
      describe('invalid link (invalid url)', () => {
        beforeEach(() => {
          hit._source.link = [
            {
              protocol: 'MY-PROTOCOL',
              url: 'https://abcd:1234:5678/@',
            },
          ]
        })
        it('parses as an invalid link', () => {
          const summary = service.toRecord(hit)
          expect(summary.links).toEqual([
            {
              invalid: true,
              reason: expect.stringContaining('URL'),
            },
          ])
        })
      })
      describe('invalid link (url with unsupported protocol)', () => {
        beforeEach(() => {
          hit._source.link = [
            {
              description: 'Download this file!',
              protocol: 'FILE',
              url: 'data:image/png;base64,aaaaabbbbbccccc',
            },
          ]
        })
        it('parses as an invalid link', () => {
          const summary = service.toRecord(hit)
          expect(summary.links).toEqual([
            {
              invalid: true,
              reason: expect.stringContaining('protocol'),
            },
          ])
        })
      })
    })

    describe('link protocols', () => {
      let summary
      describe('no protocols', () => {
        beforeEach(() => {
          summary = service.toRecord(hit)
        })
        it('hasDownloads is false', () => {
          expect(summary.hasDownloads).toBeUndefined()
        })
        it('hasMaps is false', () => {
          expect(summary.hasMaps).toBeUndefined()
        })
      })
      describe('unknwown protocols', () => {
        beforeEach(() => {
          hit._source.linkProtocol = ['MY-PROTOCOL']
          summary = service.toRecord(hit)
        })
        it('hasDownloads is false', () => {
          expect(summary.hasDownloads).toBe(false)
        })
        it('hasMaps is false', () => {
          expect(summary.hasMaps).toBe(false)
        })
      })
      describe('map and downloads protocol', () => {
        beforeEach(() => {
          hit._source.linkProtocol = ['OGC:WMS', 'WWW:DOWNLOAD:1.0']
          summary = service.toRecord(hit)
        })
        it('hasDownloads is false', () => {
          expect(summary.hasDownloads).toBe(true)
        })
        it('hasMaps is false', () => {
          expect(summary.hasMaps).toBe(true)
        })
      })
    })

    describe('full record', () => {
      it('builds a complete record object', () => {
        const record = service.toRecord(ES_FIXTURE_FULL_RESPONSE.hits.hits[0])
        expect(record).toMatchObject({
          abstract:
            "Le produit Surval \"Donn??es par param??tre\" met ?? disposition les donn??es d'observation et de surveillance bancaris??es dans Quadrige, valid??es et qui ne sont pas sous moratoire.\n\nCe syst??me d'information contient des r??sultats sur la plupart des param??tres physiques, chimiques et biologiques de description de l'environnement. Les premi??res donn??es datent par exemple de 1974 pour les param??tres de la qualit?? g??n??rale des eaux et les contaminants, 1987 pour le phytoplancton et les phycotoxines, 1989 pour la microbiologie, du d??but des ann??es 2000 pour le benthos. \n\nCe produit contient des r??sultats sur la plupart des param??tres physiques, chimiques et biologiques de description de l'environnement. Les premi??res donn??es datent par exemple de 1974 pour les param??tres de la qualit?? g??n??rale des eaux et les contaminants.\n\nLes donn??es sous moratoire ou les donn??es qualifi??es \"Faux\" sont exclus de la diffusion Surval. Une donn??e valid??e dans Quadrige aujourd???hui sera disponible dans Surval demain.\n\nL'acc??s aux donn??es d'observation se fait par lieu. Un lieu de surveillance est un lieu g??ographique o?? des observations, des mesures et/ou des pr??l??vements sont effectu??s. Il est localis?? de fa??on unique par son emprise cartographique (surface, ligne ou point). Un lieu de mesure peut ??tre utilis?? par plusieurs programmes d'observation et de surveillance.\n\nA compter du 29 avril 2021, conform??ment aux obligations de l??? ?? Open data ??, toutes les donn??es valid??es sans moratoire sont diffus??es ?? J+1 et sans traitement. Ainsi tous les param??tres et tous les programmes Quadrige sont diffus??s, et regroup??s sous forme de th??me :\n- Benthos dont r??cifs coralliens\n- Contaminants chimiques et ??cotoxicologie\n- D??chets\n- Microbiologie\n- Phytoplancton et Hydrologie\n- Ressources aquacoles\n- Zooplancton\n- Autres\nUn th??me regroupe un ou plusieurs programmes d'acquisition. Un programme correspond ?? une mise en ??uvre d'un protocole, sur une p??riode et un ensemble de lieux. Chaque programme est plac?? sous la responsabilit?? d'un animateur. \n\nPour accompagner le r??sultat, de nombreuses donn??es sont diffus??es (t??l??chargeables en tant que donn??es d???observation), comme :\n- la description compl??te du ?? Param??tre-Support-Fraction-M??thode-Unit?? ??;\n- la description compl??te des ?? Passages ??, ?? Pr??l??vements ?? et ?? ??chantillons ??;\n- le niveau de qualification du r??sultat;\n- une proposition de citation, afin d???identifier tous les organismes contribuant ?? cette observation.\n\nL'emprise g??ographique est nationale : la m??tropole et les d??partements et r??gions d'outre-mer (DROM).\n\nL'acc??s au t??l??chargement direct du jeu de donn??es complet (~ 220 Mo) en date du 9 juillet 2021 s'effectue par ce lien : https://www.ifremer.fr/sextant_doc/surveillance_littorale/surval/data/surval.zip \nL'acc??s par la carte permet de configurer des extractions et des graphes de visualisation sur demande (email demand?? pour le t??l??chargement).",
          updatedOn: new Date('2021-10-05T12:48:57.678Z'),
          createdOn: new Date('2021-10-05T12:48:57.678Z'),
          dataCreatedOn: new Date('2012-01-01T00:00:00.000Z'),
          id: '11700',
          links: [
            {
              description: '',
              name: 'La base de donn??es Quadrige',
              protocol: 'WWW:LINK',
              url: 'https://wwz.ifremer.fr/envlit/Quadrige-la-base-de-donnees',
            },
            {
              description: '',
              name: 'La surveillance du milieu marin et c??tier',
              protocol: 'WWW:LINK-1.0-http--link',
              url: 'https://wwz.ifremer.fr/envlit/Surveillance-du-littoral',
            },
            {
              description:
                'Manuel pour l???utilisation des donn??es REPHY. Informations destin??es ?? am??liorer la compr??hension des fichiers de donn??es REPHY mis ?? disposition des scientifiques et du public. ODE/VIGIES/17-15. Ifremer, ODE/VIGIES, Coordination REPHY & Cellule Quadrige (2017).',
              name: 'Manuel pour l???utilisation des donn??es REPHY',
              protocol: 'WWW:LINK',
              url: 'http://archimer.ifremer.fr/doc/00409/52016/',
            },
            {
              description: 'Lieu de surveillance (point)',
              name: 'surval_parametre_point',
              protocol: 'OGC:WMS',
              url: 'http://www.ifremer.fr/services/wms/surveillance_littorale',
            },
            {
              description: 'Lieu de surveillance (point)',
              name: 'surval_parametre_point',
              protocol: 'OGC:WFS',
              url: 'http://www.ifremer.fr/services/wfs/surveillance_littorale',
            },
            {
              description: "Extraction des donn??es d'observation",
              name: 'r:survalextraction30140',
              protocol: 'OGC:WPS',
              url: 'https://www.ifremer.fr/services/wps3/surval',
            },
            {
              description: 'Lieu de surveillance (ligne)',
              name: 'surval_parametre_ligne',
              protocol: 'OGC:WMS',
              url: 'http://www.ifremer.fr/services/wms/surveillance_littorale',
            },
            {
              description: 'Lieu de surveillance (ligne)',
              name: 'surval_parametre_ligne',
              protocol: 'OGC:WFS',
              url: 'http://www.ifremer.fr/services/wfs/surveillance_littorale',
            },
            {
              description: "Extraction des donn??es d'observation",
              name: 'r:survalextraction30140',
              protocol: 'OGC:WPS',
              url: 'https://www.ifremer.fr/services/wps3/surval',
            },
            {
              description: 'Lieu de surveillance (polygone)',
              name: 'surval_parametre_polygone',
              protocol: 'OGC:WMS',
              url: 'http://www.ifremer.fr/services/wms/surveillance_littorale',
            },
            {
              description: 'Lieu de surveillance (polygone)',
              name: 'surval_parametre_polygone',
              protocol: 'OGC:WFS',
              url: 'http://www.ifremer.fr/services/wfs/surveillance_littorale',
            },
            {
              description: "Extraction des donn??es d'observation",
              name: 'r:survalextraction30140',
              protocol: 'OGC:WPS',
              url: 'https://www.ifremer.fr/services/wps3/surval',
            },
            {
              description: 'DOI du jeu de donn??es',
              name: 'DOI du jeu de donn??es',
              protocol: 'WWW:LINK-1.0-http--metadata-URL',
              url: 'https://doi.org/10.12770/cf5048f6-5bbf-4e44-ba74-e6f429af51ea',
            },
          ],
          metadataUrl: 'url',
          thumbnailUrl:
            'https://sextant.ifremer.fr/geonetwork/srv/api/records/cf5048f6-5bbf-4e44-ba74-e6f429af51ea/attachments/parametres.gif',
          title: 'Surval - Donn??es par param??tre',
          uuid: 'cf5048f6-5bbf-4e44-ba74-e6f429af51ea',
          contact: {
            name: "Cellule d'administration Quadrige",
            organisation: 'Ifremer',
            email: 'q2suppor@ifremer.fr',
            website: 'https://www.ifremer.fr/',
            logoUrl:
              'http://localhost/geonetwork/images/logos/81e8a591-7815-4d2f-a7da-5673192e74c9.png',
          },
          updateStatus: 'Mise ?? jour continue',
          updateFrequency: 'Journali??re',
          keywords: [
            'Lieux de surveillance',
            'Observation',
            'Surveillance',
            'Environnement',
            'Littoral',
            'Quadrige',
            'DCE',
            'DCSMM',
            'OSPAR',
            'MEDPOL',
            'Donn??es ouvertes',
            'Open Data',
            'Surval',
            'Installations de suivi environnemental',
            'D8: Contaminants',
            'D1: Biodiversit??',
            'D7: Changements hydrographiques',
            'D4: R??seaux trophiques',
            'D5: Eutrophisation',
            'D9: Questions sanitaires',
            'D10: D??chets marins',
            'D1: Biodiversit?? - Habitats benthiques',
            'D1: Biodiversit?? - Habitats p??lagiques',
            'D1: Biodiversit?? - Poissons',
            'D1: Biodiversit?? - Mammif??res',
            'D1: Biodiversit?? - Tortues',
            'D1: Biodiversit?? - C??phalopodes',
            'National',
            'Observation par point',
            'Observation directe',
            "/Activit??s humaines/R??seaux d'observation et de surveillance du littoral",
            '/Observations in-situ/R??seaux',
            'Base de donn??es de recherche',
            'Dispositifs de surveillance',
            '/Biologie marine/Bivalves',
            '/Biog??ochimie marine/El??ments chimiques et contaminants',
            "/Physique de l'Oc??an/Turbidit??",
            '/Biog??ochimie marine/Pigments',
            '/Biologie marine/Toxines',
            '/Biologie marine/Phytoplancton',
            '/Biologie marine/Zooplancton',
            "/Physique de l'Oc??an/Temp??rature",
            "/Physique de l'Oc??an/Salinit??",
            '/Biog??ochimie marine/Oxyg??ne dissous',
            '/Biologie marine/Organismes pathog??nes',
            '/Biologie marine/Organismes marins tropicaux',
            '/Biologie marine/Mati??re en suspension',
            '/Biog??ochimie marine/Nutriments (sels nutritifs)',
            '/Biologie marine/Habitats benthiques',
            '/Etat du Milieu/Biog??ochimie',
            '/Etat du Milieu/Pollutions',
            '/Etat du Milieu/Littoral',
            '/Etat du Milieu/Habitats',
            '/Etat du Milieu/Esp??ces',
            'Brest',
            'Fort-de-France',
            'Boulogne-sur-Mer',
            'Noum??a',
            'Toulon',
            'S??te',
            'La Rochelle',
          ],
          lineage:
            'Les donn??es sont bancaris??es dans la base de donn??es Quadrige.',
          usageConstraints: 'Restriction li?? ?? l???exercice du droit moral',
          catalogUuid: '81e8a591-7815-4d2f-a7da-5673192e74c9',
        } as MetadataRecord)
      })
    })
  })
})
