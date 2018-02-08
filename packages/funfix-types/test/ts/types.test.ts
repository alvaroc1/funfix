/*!
 * Copyright (c) 2017-2018 by The Funfix Project Developers.
 * Some rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from "assert"
import * as types from "../../src"
import { HK } from "../../src"

class Box<A> implements HK<"box", A> {
  readonly _URI: "box"
  readonly _A: A
  constructor(public readonly value: A) {}
}

type Types =
  types.Setoid<Box<any>> &
  types.Functor<"box"> &
  types.Apply<"box"> &
  types.Applicative<"box"> &
  types.Chain<"box">

const t: Types = {
  equals: (x, y) =>
    (x as Box<any>).value === (y as Box<any>).value,
  map: <A, B>(fa: HK<"box", A>, f: (a: A) => B) =>
    new Box(f((fa as Box<A>).value)),
  ap: <A, B>(ff: HK<"box", (a: A) => B>, fa: HK<"box", A>) => {
    const f = (ff as Box<(a: A) => B>).value
    const a = (fa as Box<A>).value
    return new Box(f(a))
  },
  of<A>(a: A) {
    return new Box(a)
  },
  chain<A, B>(fa: HK<"box", A>, f: (a: A) => HK<"box", B>) {
    return f((fa as Box<A>).value)
  }
}

describe("type tests", () => {
  it("setoid", () => {
    // Dummy test meant to prevent errors due to this project not
    // exposing any actual executable code
    assert.ok(t.equals(new Box(1), new Box(1)))
    assert.ok(!t.equals(new Box(1), new Box(2)))
  })

  it("functor", () => {
    const fb = t.map(new Box(1), x => x + 1)
    assert.equal((fb as Box<number>).value, 2)
  })

  it("apply", () => {
    const fb = t.ap(new Box((a: number) => a + 1), new Box(1))
    assert.equal((fb as Box<number>).value, 2)
  })

  it("applicative", () => {
    const fb = t.ap(new Box((a: number) => a + 1), t.of(1))
    assert.equal((fb as Box<number>).value, 2)
  })

  it("chain", () => {
    const fb = t.chain(new Box(1), a => new Box(a + 1))
    assert.equal((fb as Box<number>).value, 2)
  })
})