import { BehaviorSubject } from "rxjs"
import { createDraft, finishDraft, Patch } from "immer"

export type UpdateFunction<S> = (subState: S) => void

export interface Message {
  type: string
  payload?: any
}

export interface MetaInfo extends Message {
  // nothing here
}

export const UPDATE = "@RX/UPDATE"

const defaultMetaInfo = {
  type: UPDATE
}

export const INIT_MESSAGE: Message = {
  type: "@RX/INIT"
}

interface MiddlewareProps<S> {
  state: S
  metaInfo: MetaInfo
  next(): any
}

export interface NextErrorMessage<STATE> {
  error: Error
  state: STATE
  metaInfo: MetaInfo
}

export type Middleware<S> = (props: MiddlewareProps<S>) => any

export interface RxStoreOptions {
  freeze: boolean
  storeName: string
}

export class RxStore<STATE> {
  protected _state$: BehaviorSubject<STATE>

  protected _meta$: BehaviorSubject<MetaInfo> = new BehaviorSubject(
    INIT_MESSAGE
  )

  protected _patches$: BehaviorSubject<Patch[]> = new BehaviorSubject([] as any)

  protected _inversePatches$: BehaviorSubject<Patch[]> = new BehaviorSubject(
    [] as any
  )

  protected _messageBus$: BehaviorSubject<Message> = new BehaviorSubject(
    INIT_MESSAGE
  )

  protected _error$: BehaviorSubject<NextErrorMessage<
    STATE
  > | null> = new BehaviorSubject(null as any)

  protected _options: RxStoreOptions

  protected _middleware: Middleware<STATE>[] = []

  constructor(
    x: BehaviorSubject<STATE>,
    middleware: Middleware<STATE>[],
    options: RxStoreOptions
  ) {
    this._state$ = x
    this._options = options
    this._middleware = middleware
  }

  static of<S>(
    state: BehaviorSubject<S>,
    middleware: Middleware<S>[],
    options: RxStoreOptions
  ) {
    return new RxStore(state, middleware, options)
  }

  next(
    updateFunctionOrNextState: UpdateFunction<STATE> | STATE,
    metaInfo: MetaInfo = defaultMetaInfo
  ) {
    try {
      const currentState = this.state$.value
      const isUpdateFunction = updateFunctionOrNextState instanceof Function

      const draft = isUpdateFunction
        ? (createDraft(currentState) as STATE)
        : (createDraft(updateFunctionOrNextState) as STATE)

      const draftMetaInfos = createDraft(metaInfo)

      if (updateFunctionOrNextState instanceof Function) {
        updateFunctionOrNextState(draft)
      }

      recursiveMiddlewareHandler(this._middleware, draft, draftMetaInfos)

      const nextState = finishDraft(draft, (patches, inversePatches) => {
        this.patches$.next(patches)
        this.inversePatches$.next(inversePatches)
      }) as STATE

      const nextMetaInfo = finishDraft(draftMetaInfos)

      this.state$.next(nextState)
      this.meta$.next(nextMetaInfo)
      this.error$.next(null as any)

      return { state: nextState, metaInfo: nextMetaInfo }
    } catch (e) {
      this._error$.next({ error: e, state: this.state$.value, metaInfo })
      return e
    }
  }

  dispatch(message: Message) {
    this.messageBus$.next(message)
  }

  get state(): Readonly<STATE> {
    return this._state$.value
  }

  get state$() {
    return this._state$
  }

  get patches$() {
    return this._patches$
  }

  get inversePatches$() {
    return this._inversePatches$
  }

  get meta$() {
    return this._meta$
  }

  get messageBus$() {
    return this._messageBus$
  }

  get error$() {
    return this._error$
  }

  get options() {
    return this._options
  }

  get middleware() {
    return this._middleware
  }
}

function recursiveMiddlewareHandler<STATE>(
  middleware: Middleware<STATE>[],
  state: STATE,
  metaInfo: MetaInfo
) {
  if (middleware.length === 0) {
    return {
      state,
      metaInfo
    }
  }

  const nextCall = middleware[0]
  const rest = middleware.slice(1, middleware.length)
  const nextFunction = async () => {
    await recursiveMiddlewareHandler(rest, state, metaInfo)
  }

  return nextCall({
    state,
    metaInfo,
    next: nextFunction
  })
}
