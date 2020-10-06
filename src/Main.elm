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

type alias Model =
  { sticks : Set String
  , players : List Int
  , activePlayer : Int
  }
init : Model
init =
  { sticks = ids
  , players = [1, 2]
  , activePlayer = 1
  }


type  Msg
   = StickSelected String

update : Msg -> Model -> Model
update msg model =
  case msg of
    StickSelected key ->
      { model | sticks = Set.remove key model.sticks }
      

stickEl : Set String -> Int -> Int -> Html Msg
stickEl stickIds n r =
  span
    [ class (getStickClass stickIds (formatId n r))
    , onClick (StickSelected (formatId n r))
    ]
    []

rowEl : Set String -> Int -> Html Msg
rowEl stickIds n = div [class "row"] (List.map (stickEl stickIds n)(spread n))

playerButtonEl : Int -> Int -> Html Msg
playerButtonEl activePlayerId playerId =
  button
    [disabled (not (playerId == activePlayerId))]
    [text ("p" ++ String.fromInt playerId)]

view : Model -> Html Msg
view model =
  div [class "container"]
    (List.concat
      [ List.map (playerButtonEl model.activePlayer) model.players
      , List.map (rowEl model.sticks) rows
      ]
    )