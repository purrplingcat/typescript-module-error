import EventEmitter from "events";
import useLogger from "./hooks/logger";
import { State, StateManager } from "./components/state";

const logger = useLogger();

export interface SensesState {
  night: boolean
  profile: string
  presence: "home" | "away"
}

export class Senses extends EventEmitter {
  tps = 20
  stateManager: StateManager

  private _readyAt = 0
  private _timeout: NodeJS.Timeout | null = null
  private loop = () => {
    this.update()
    this._timeout = setTimeout(this.loop, 1000 / this.tps)
  }

  constructor() {
    super()
    this.stateManager = new StateManager(this)
    this.stateManager.register(new State<SensesState>("senses", {}))
  }

  get ready(): boolean {
    return this._readyAt > 0
  }

  get readyAt() {
    return this._readyAt
  }

  get state(): State<SensesState> {
    return this.stateManager.get("senses") as State<SensesState>
  }

  isReady = () => this.ready
  isNight = () => this.state.data.night
  isDay = () => !this.state.data.night

  start()
  {
    if (this.ready) {
      throw new Error("Senses controller is already running!")
    }
    
    if (this._timeout) {
      clearTimeout(this._timeout)
    }

    this.loop()
    this._readyAt = Date.now()
    this.emit("start", this, this._readyAt)
    logger.info("Senses controller is ready")
  }

  update() {
    if (!this.ready) { return }

    this.emit("update", this)
  }
}
