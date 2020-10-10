module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (class, disabled)
import List
import Set exposing (Set)
import Html.Events exposing (onClick)

main = Browser.sandbox { init = init, update = update, view = view }

rows : List Int
rows = List.indexedMap (+) (List.range 1 4)
 
sticks : Int  -> List String
sticks row  = List.map (combine row) (spread row)
--
spread : Int -> List Int
spread n = List.range 1 n

getStickClass : Set String -> String -> String
getStickClass stickIds id = if Set.member id stickIds then "stick"  else "stick hidden"

formatId : Int -> Int -> String
formatId n1 n2 = String.fromInt n1 ++ ":" ++ String.fromInt n2

combine : Int -> Int -> String
combine rowValue itemIndex = formatId rowValue itemIndex

ids : Set String
ids = Set.fromList (List.concat (List.map sticks rows))

parseStickId : String -> Int
parseStickId id = quickToInt (String.right 1 id)

parseRowId : String -> String
parseRowId id = String.left 1 id

quickToInt : String -> Int
quickToInt s = Maybe.withDefault 0 (String.toInt s)

checkSelected : String -> String -> Bool
checkSelected row id = row == (String.left 1 id)

countRemainingSticksByRow : String -> Set String -> Int
countRemainingSticksByRow key stickIds = Set.size (Set.filter (checkSelected (String.left 1 key)) (Set.remove key stickIds))

checkLastMove : String -> Set String -> Bool
checkLastMove key stickIds = countRemainingSticksByRow key stickIds == 0

type alias Model =
  { sticks : Set String
  , players : List Int
  , activePlayer : Int
  , lastClicked : String
  }
init : Model
init =
  { sticks = ids
  , players = [0, 1]
  , activePlayer = 0
  , lastClicked = "0"
  }

type  Msg
   = StickSelected String
   | TurnEnded

updateSticks : String -> Set String -> Set String
updateSticks key stickIds =
  if checkLastMove key stickIds
  then stickIds
  else Set.remove key stickIds

toggleActivePlayer : Int -> Int
toggleActivePlayer activePlayer = abs (activePlayer - 1)

updateActivePlayer : String -> Model -> Int
updateActivePlayer key model =
  if (checkLastMove key model.sticks) && (checkValidClick key model)
  then toggleActivePlayer model.activePlayer
  else model.activePlayer

checkValidClick : String -> Model -> Bool
checkValidClick key model = model.lastClicked == "0" || (model.lastClicked == parseRowId key)

update : Msg -> Model -> Model
update msg model =
  case msg of
    StickSelected key ->
      { model
        | sticks =
            if (checkValidClick (Debug.log "key" key) model)
            then Set.remove key model.sticks
            else model.sticks
        , activePlayer = updateActivePlayer key model
        , lastClicked =
            if (checkValidClick key model) && (checkLastMove key model.sticks) then "0"
            else if checkValidClick key model then parseRowId key
            else model.lastClicked
      }
    TurnEnded ->
      { model | activePlayer = toggleActivePlayer model.activePlayer, lastClicked = "0" }
      
checkHidden : String -> Set String -> Bool
checkHidden key stickIds = not (Set.member key stickIds)

stickEl : Set String -> Int -> Int -> Html Msg
stickEl stickIds n r =
  span
    [ class (getStickClass stickIds (formatId n r))
    , onClick
      ( StickSelected
        ( if (checkHidden (formatId n r) stickIds)
          then "-1:-1"
          else formatId n r
        )
      )
    ]
    []

rowEl : Set String -> Int -> Html Msg
rowEl stickIds n = div [class "row"] (List.map (stickEl stickIds n)(spread n))

playerButtonEl : Int -> Int -> Html Msg
playerButtonEl activePlayerId playerId =
  button
    [disabled (not (playerId == activePlayerId))]
    [text ("p" ++ String.fromInt (playerId + 1))]

view : Model -> Html Msg
view model =
  div [class "container"]
    (List.concat
      [ List.map (playerButtonEl model.activePlayer) model.players
      , List.map (rowEl model.sticks) rows
      , [button [class "turn", onClick TurnEnded][text "End Turn"]]
      ]
    )