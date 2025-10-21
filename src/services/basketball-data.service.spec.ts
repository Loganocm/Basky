import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BasketballDataService, ExtendedPlayer } from './basketball-data.service';

interface BackendPlayer { id: number; name: string; team: string; position: string; }

describe('BasketballDataService', () => {
  let service: BasketballDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BasketballDataService,
        provideHttpClient(withInterceptorsFromDi()),
      ]
    });

    service = TestBed.inject(BasketballDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch players from backend and map to ExtendedPlayer', () => {
    const mockBackend: BackendPlayer[] = [
      { id: 101, name: 'Nikola Jokic', team: 'DEN', position: 'C' },
      { id: 102, name: 'Luka Doncic', team: 'DAL', position: 'PG' },
    ];

    // Constructor triggers refreshPlayers(), refreshTeams(), and refreshGames()
    const playersReq = httpMock.expectOne('http://localhost:8080/api/players');
    expect(playersReq.request.method).toBe('GET');
    playersReq.flush(mockBackend);

    // Also need to handle teams and games requests from constructor
    const teamsReq = httpMock.expectOne('http://localhost:8080/api/teams');
    teamsReq.flush([]);
    
    const gamesReq = httpMock.expectOne('http://localhost:8080/api/games');
    gamesReq.flush([]);

    const players: ExtendedPlayer[] = service.getPlayers();
    expect(players.length).toBe(2);
    expect(players[0].name).toBe('Nikola Jokic');
    expect(players[0].position).toBe('C');

    // Ensure extended defaults exist
    expect(players[0].points).toBeDefined();
    expect(players[0].playerEfficiencyRating).toBeDefined();
  });
});
