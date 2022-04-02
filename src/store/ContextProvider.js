import { useReducer, createContext } from "react";

// (json api): institucion[]
// institucion: nombre, bandera, jugadores[]
// playerElegido: Nombre Imagen Posicion Id
// Team: Nombre, Cuadro, players[]

export const Context = createContext({
  data: [],
  teams: [],
  gameMode: undefined,
  loadingData: false,

  addData: (gameMode) => {},
  addTeam: (name) => {},
  removeTeam: (name) => {},
  editTeamName: (name, newName) => {},
  addPlayerToTeam: (team, playerObj) => {},
  removePlayerFromTeam: (team, playerId) => {},
});

const defaultState = {
  data: [],
  teams: [],
  gameMode: undefined,
  loadingData: false,
};

const reducer = (state, action) => {
  if (action.type === "ADD_DATA") {
    return {
      ...state,
      data: action.data,
    };
  }
  if (action.type === "CHANGE_GAME_MODE") {
    return {
      ...state,
      gameMode: action.gameMode,
    };
  }

  if (action.type === "CHANGE_LOADING_STATE") {
    return {
      ...state,
      loadingData: action.state,
    };
  }

  if (action.type === "ADD_TEAM") {
    const uid = `teamId-${Date.now()}`;
    const teamsUpdated = [...state.teams];
    teamsUpdated.push({
      id: uid,
      name: action.name,
      logo: action.logo,
      players: [],
    });

    return {
      ...state,
      teams: teamsUpdated,
    };
  }

  if (action.type === "REMOVE_TEAM") {
  }

  if (action.type === "EDIT_TEAM") {
  }

  if (action.type === "ADD_PLAYER") {
    const { playerObj } = action;
    //check if player was already selected
    const confirmedPlayers = state.teams.map((team) => team.players).flat();
    const unconfirmedPlayer =
      confirmedPlayers.findIndex((player) => player.id === playerObj.id) === -1;
    if (unconfirmedPlayer) {
      const selectedTeam = state.teams.find((team) => team.id === action.team);

      selectedTeam.players.push(playerObj);

      const unselectedTeam = state.teams.find(
        (team) => team.id !== action.team
      );
      console.log([selectedTeam, unselectedTeam]);
      return {
        ...state,
        teams: [selectedTeam, unselectedTeam],
      };
    } else {
      return {
        ...state,
      };
    }
  }

  if (action.type === "REMOVE_PLAYER") {
  }
  return state;
};

const ContextProvider = (props) => {
  const [state, dispatchAction] = useReducer(reducer, defaultState);

  const addDataHandler = async (gameMode) => {
    //prevent re-fetching when selecting current selected mode.
    if (gameMode !== state.gameMode) {
      dispatchAction({ type: "CHANGE_GAME_MODE", gameMode });
      dispatchAction({ type: "CHANGE_LOADING_STATE", state: true });
      let leagueId;

      if (gameMode === "modoAFA") {
        leagueId = 44;
      } else if (gameMode === "modoMundialista") {
        leagueId = 28;
      } else {
        leagueId = -1; //error
      }

      try {
        const response = await fetch(
          `https://apiv3.apifootball.com/?action=get_teams&league_id=${leagueId}&APIkey=${process.env.REACT_APP_API_KEY}`
        );

        const data = await response.json();

        if (data.hasOwnProperty("error")) {
          throw new Error("Request failed");
        }
        dispatchAction({ type: "CHANGE_LOADING_STATE", state: false });
        dispatchAction({ type: "ADD_DATA", data });
      } catch (err) {}
    }
  };
  const addTeamHandler = (name, logo) => {
    if (state.teams.length < 2) {
      dispatchAction({ type: "ADD_TEAM", name, logo });
    }
  };
  const removeTeamHandler = (name) => {
    dispatchAction({ type: "REMOVE_TEAM", name });
  };
  const editTeamNameHandler = (name, newName) => {
    dispatchAction({ type: "EDIT_TEAM", name, newName });
  };
  const addPlayerToTeamHandler = (team, playerObj) => {
    dispatchAction({ type: "ADD_PLAYER", team, playerObj });
  };
  const removePlayerFromTeamHandler = (team, playerId) => {
    dispatchAction({ type: "REMOVE_PLAYER", team, playerId });
  };

  const context = {
    gameMode: state.gameMode,
    loadingData: state.loadingData,
    data: state.data,
    teams: state.teams,
    addData: addDataHandler,
    addTeam: addTeamHandler,
    removeTeam: removeTeamHandler,
    editTeamName: editTeamNameHandler,
    addPlayerToTeam: addPlayerToTeamHandler,
    removePlayerFromTeam: removePlayerFromTeamHandler,
  };

  return <Context.Provider value={context}>{props.children}</Context.Provider>;
};

export default ContextProvider;
