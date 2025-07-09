  {result && Array.isArray(result) && result.length > 0 && (
    <div className="space-y-8">
      {result.map((block: {
        store: { id: string; name: string };
        lastName: string;
        firstName: string;
        middleName?: string;
        phone?: string;
        address?: string;
        passportSeries: string;
        passportNumber: string;
        isBlacklisted: boolean;
        installments: Array<{ id: string; productName: string; status: string; createdAt: string }>;
      }) => {
        const overdueInstallments = block.installments.filter(i => i.status === "overdue")
        return (
          <Card key={block.store.id} className={block.isBlacklisted ? "border-red-500" : overdueInstallments.length ? "border-yellow-500" : ""}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{block.store.name}</CardTitle>
                <div className="text-xs text-muted-foreground">Магазин #{block.store.id.slice(-6)}</div>
              </div>
              {block.isBlacklisted ? (
                <Badge className="bg-red-100 text-red-800"><Ban className="h-3 w-3 mr-1" />В чёрном списке</Badge>
              ) : overdueInstallments.length > 0 ? (
                <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Есть просрочки</Badge>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6 md:items-center">
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-lg">{block.lastName} {block.firstName} {block.middleName}</div>
                  <div className="text-sm text-muted-foreground">{block.phone}</div>
                  <div className="text-sm text-muted-foreground">{block.address}</div>
                  <div className="text-xs text-gray-400">Паспорт: {block.passportSeries} {block.passportNumber}</div>
                </div>
              </div>
              {overdueInstallments.length > 0 && (
                <div>
                  <div className="font-semibold mb-2">Просроченные рассрочки:</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Товар</TableHead>
                        <TableHead>Дата</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overdueInstallments.map(i => (
                        <TableRow key={i.id} className="bg-yellow-50">
                          <TableCell>{i.productName}</TableCell>
                          <TableCell>{new Date(i.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )} 