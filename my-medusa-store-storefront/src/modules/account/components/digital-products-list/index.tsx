"use client"

import { Table } from "@medusajs/ui"
import { DigitalProduct } from "../../../../types/global"
import { getDigitalMediaDownloadLink } from "../../../../lib/data/digital-products"

type Props = {
  digitalProducts: DigitalProduct[]
}

export const DigitalProductsList = ({ digitalProducts }: Props) => {
  const handleDownload = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    mediaId: string
  ) => {
    e.preventDefault()

    const url = await getDigitalMediaDownloadLink(mediaId)

    window.open(url)
  }
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Created Date</Table.HeaderCell>
          <Table.HeaderCell>Expired Date</Table.HeaderCell>
          <Table.HeaderCell>Action</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {digitalProducts.map((digitalProduct) => {
          const medias = digitalProduct.medias?.filter(
            (media) => media.type === "main"
          )
          const showMediaCount = (medias?.length || 0) > 1
          return (
            <Table.Row key={digitalProduct.id}>
              <Table.Cell>{digitalProduct.name}</Table.Cell>
              <Table.Cell>
                {digitalProduct.created_date.toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                {digitalProduct.expired_date.toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                <a href="/documentation">Documentation</a>
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
